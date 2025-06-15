use std::{fs::create_dir_all, io::Read};

use tauri::{Error, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  builder = builder
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_hypergraphsql::init())
    .plugin(
      tauri_plugin_log::Builder::new()
        .level(log::LevelFilter::Info)
        .level_for("toda", log::LevelFilter::Debug)
        .build(),
    );

  builder = builder.setup(|app| {
    let home_dir = app.path().home_dir()?;
    create_dir_all(home_dir.join(".toda").join("databases"))?;
    create_dir_all(home_dir.join(".toda").join("extensions"))?;
    Ok(())
  });

  #[cfg(debug_assertions)]
  {
    builder = builder.setup(|app| {
      use tauri::Manager;
      if let Some(webview) = app.get_webview_window("main") {
        webview.open_devtools();
      }
      Ok(())
    });
  }

  builder = builder.register_uri_scheme_protocol("toda", |ctx, req| {
    let home_dir = match ctx.app_handle().path().home_dir() {
      Ok(p) => p,
      Err(e) => return internal_server_error(e),
    };
    let (namespace, path) = match extract_extension_resource_path(&req) {
      Some(p) => p,
      None => return not_found_response(),
    };
    let root = home_dir.join(".toda").join("extensions").join(namespace);
    let filename = match std::fs::File::open(root.join("package.json")) {
      Ok(file) => match serde_json::from_reader::<_, serde_json::Value>(file) {
        Ok(json) => {
          if let Some(package_json) = json.as_object() {
            root
              .join(
                package_json
                  .get("view")
                  .and_then(serde_json::Value::as_str)
                  .map(ToOwned::to_owned)
                  .unwrap_or_default(),
              )
              .join(path)
          } else {
            return not_found_response();
          }
        }
        Err(e) => return internal_server_error(Error::Json(e)),
      },
      Err(e) => return internal_server_error(Error::Io(e)),
    };
    match std::fs::File::open(filename) {
      Ok(mut file) => {
        let mut contents = Vec::new();
        if let Err(e) = file.read_to_end(&mut contents) {
          return internal_server_error(Error::Io(e));
        }

        http::Response::builder()
          .status(http::StatusCode::OK)
          .header("Content-Length", contents.len().to_string())
          .body(contents)
          .unwrap()
      }
      Err(e) => return internal_server_error(Error::Io(e)),
    }
  });

  builder
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn internal_server_error(e: Error) -> http::Response<Vec<u8>> {
  log::error!("{:?}", e);
  http::Response::builder()
    .status(http::StatusCode::INTERNAL_SERVER_ERROR)
    .header("Content-Type", "text/plain")
    .body(b"500 Internal Server Error".to_vec())
    .unwrap()
}

fn not_found_response() -> http::Response<Vec<u8>> {
  http::Response::builder()
    .status(http::StatusCode::NOT_FOUND)
    .header("Content-Type", "text/plain")
    .body(b"404 Not Found".to_vec())
    .unwrap()
}

fn extract_extension_resource_path<T>(req: &http::Request<T>) -> Option<(String, String)> {
  let uri = req.uri().to_string();
  if !uri.starts_with("toda://") {
    return None;
  }
  let path = uri["toda://".len()..].to_owned();
  if let Some((name, rest)) = path.split_once('/') {
    if let Some((namespace, name)) = name.split_once('.') {
      let mut new_name = String::new();
      new_name.push('@');
      new_name.push_str(namespace);
      new_name.push('/');
      new_name.push_str(name);
      return Some((new_name, rest.to_owned()));
    } else {
      return Some((name.to_owned(), rest.to_owned()));
    }
  }
  Some((path, "index.html".to_owned()))
}

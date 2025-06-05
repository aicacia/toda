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
    create_dir_all(home_dir.join(".toda").join("plugins"))?;
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

  builder = builder.register_uri_scheme_protocol("plugins", |ctx, req| {
    let home_dir = match ctx.app_handle().path().home_dir() {
      Ok(p) => p,
      Err(e) => return internal_server_error(e),
    };
    let resource_relative_path = match extract_plugin_resource_path(&req) {
      Some(p) => p,
      None => return not_found_response(),
    };
    let root = home_dir.join(".toda").join("plugins");
    match std::fs::File::open(root.join(&resource_relative_path)) {
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
      Err(e) => internal_server_error(Error::Io(e)),
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

fn extract_plugin_resource_path<T>(req: &http::Request<T>) -> Option<String> {
  let uri = req.uri().to_string();

  if !uri.starts_with("plugins://") {
    return None;
  }

  return Some((&uri["plugins://".len()..]).to_owned());
}

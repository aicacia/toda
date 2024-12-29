use std::fs::create_dir_all;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  builder = builder
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_hypergraphsql::init());

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

  builder
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

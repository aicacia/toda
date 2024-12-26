use std::{collections::HashMap, fs::create_dir_all, sync::RwLock};

use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tauri::Manager;

lazy_static! {
  static ref SQLITE_POOLS: RwLock<HashMap<String, sqlx::SqlitePool>> = RwLock::new(HashMap::new());
}

#[derive(Serialize, Deserialize)]
pub enum QueryKind {
  #[serde(rename = "node_edge")]
  NodeEdge,
  #[serde(rename = "node")]
  Node,
  #[serde(rename = "edge")]
  Edge,
}

async fn get_pool(
  app_handle: tauri::AppHandle,
  filename: String,
) -> Result<sqlx::SqlitePool, String> {
  let home_dir = match app_handle.path().home_dir() {
    Ok(home_dir) => home_dir,
    Err(e) => return Err(e.to_string()),
  };
  let full_dirname = home_dir.join(".toda").join("databases");
  match create_dir_all(&full_dirname) {
    Ok(_) => (),
    Err(e) => return Err(e.to_string()),
  };
  let full_filename = full_dirname.join(filename).to_string_lossy().into_owned();
  let pool: sqlx::SqlitePool;
  'pool: {
    match SQLITE_POOLS.read() {
      Ok(pools) => {
        if let Some(p) = pools.get(&full_filename) {
          pool = p.clone();
          break 'pool;
        }
      }
      Err(e) => return Err(e.to_string()),
    };
    pool = match hypergraphsql::create_pool(&full_filename).await {
      Ok(p) => p,
      Err(e) => return Err(e.to_string()),
    };
    match SQLITE_POOLS.write() {
      Ok(mut pools) => {
        pools.insert(full_filename, pool.clone());
      }
      Err(e) => return Err(e.to_string()),
    };
  };
  Ok(pool)
}

#[tauri::command]
async fn query(
  app_handle: tauri::AppHandle,
  filename: String,
  kind: QueryKind,
  query: hypergraphsql::Query,
) -> Result<serde_json::Value, String> {
  let pool = get_pool(app_handle, filename).await?;
  let result = match kind {
    QueryKind::NodeEdge => match query
      .node_edges::<serde_json::Value, serde_json::Value, serde_json::Value>(&pool)
      .await
    {
      Ok(rows) => serde_json::to_value(&rows),
      Err(e) => return Err(e.to_string()),
    },
    QueryKind::Node => match query.nodes::<serde_json::Value>(&pool).await {
      Ok(rows) => serde_json::to_value(&rows),
      Err(e) => return Err(e.to_string()),
    },
    QueryKind::Edge => match query.edges::<serde_json::Value>(&pool).await {
      Ok(rows) => serde_json::to_value(&rows),
      Err(e) => return Err(e.to_string()),
    },
  };
  match result {
    Ok(json) => Ok(json),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
async fn create_node(
  app_handle: tauri::AppHandle,
  filename: String,
  uri: String,
  node: serde_json::Value,
) -> Result<String, String> {
  let pool = get_pool(app_handle, filename).await?;
  let node = match hypergraphsql::create_node(&pool, &uri, node).await {
    Ok(node) => node,
    Err(e) => return Err(e.to_string()),
  };
  match serde_json::to_string(&node) {
    Ok(json) => Ok(json),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
async fn create_edge(
  app_handle: tauri::AppHandle,
  filename: String,
  from_node_id: i64,
  to_node_id: i64,
  uri: String,
  edge: Option<serde_json::Value>,
) -> Result<String, String> {
  let pool = get_pool(app_handle, filename).await?;
  let node =
    match hypergraphsql::create_edge_with_ids(&pool, from_node_id, to_node_id, &uri, edge).await {
      Ok(node) => node,
      Err(e) => return Err(e.to_string()),
    };
  match serde_json::to_string(&node) {
    Ok(json) => Ok(json),
    Err(e) => Err(e.to_string()),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default().invoke_handler(tauri::generate_handler![
    query,
    create_node,
    create_edge
  ]);

  builder = builder.plugin(tauri_plugin_fs::init());

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

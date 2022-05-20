#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use futures::{lock::Mutex, SinkExt};
use tauri::{Result, State};

use crate::websocket::{listen, WebSocketState};

pub mod websocket;

pub struct Config {
  ws_url: String,
}

/// The payload that carries messages from the WebSocket server.
/// Should line up with the WSPayload interface defined in the frontend.
#[derive(Clone, serde::Serialize)]
struct WSPayload {
  message: String,
}

#[tauri::command]
async fn send_message(state: State<'_, WebSocketState>, message: String) -> Result<()> {
  let mut guard = state.write.lock().await;

  // unwrap option inside MutexGuard
  let conn = match &mut *guard {
    Some(x) => x,
    None => panic!(""),
  };

  // todo: handle errors
  conn.feed(message.into()).await.unwrap();
  conn.flush().await.unwrap();

  Ok(())
}

#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .manage::<Config>(Config {
      ws_url: "ws://localhost:8080/ws".into(),
    })
    .manage::<WebSocketState>(WebSocketState {
      write: Mutex::from(None),
    })
    .setup(|app| {
      tokio::spawn(listen(app.handle()));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![send_message])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use command::{create_user, send_message, validate_password, validate_username};
use futures::lock::Mutex;
use user::auth::AuthenticationState;
use websocket::{listen, pinger, WebSocketState};

pub mod command;
pub mod events;
pub mod user;
pub mod websocket;

pub struct Config {
  ws_url: String,
  ping_interval: u64,
}

#[tokio::main]
async fn main() {
  tauri::Builder::default()
    .manage::<Config>(Config {
      ws_url: "ws://localhost:8080/ws".into(),
      ping_interval: 5,
    })
    .manage::<WebSocketState>(WebSocketState {
      write: Mutex::from(None),
      ping: Default::default(),
    })
    .manage::<AuthenticationState>(AuthenticationState::default())
    .setup(|app| {
      tokio::spawn(listen(app.handle()));
      tokio::spawn(pinger(app.handle()));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      send_message,
      validate_password,
      validate_username,
      create_user
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

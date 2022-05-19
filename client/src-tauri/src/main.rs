#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{sync::Mutex, thread};

use futures::{executor, stream::SplitSink, FutureExt, SinkExt, StreamExt};
use tauri::{Manager, State};
use tokio::net::TcpStream;
use tokio_tungstenite::{tungstenite::Message, MaybeTlsStream, WebSocketStream};
use websocket::connect_websocket;

pub mod websocket;

#[derive(Clone, serde::Serialize)]
struct WSPayload {
  message: String,
}

// struct WebSocketWrite(Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>);
// struct WebSocketRead(Mutex<SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>>);

struct WebSocketState {
  write: Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>,
}

#[tauri::command]
fn send_message(state: State<WebSocketState>, message: String) -> () {
  let mut conn = state.write.lock().unwrap();
  executor::block_on(conn.feed(message.into())).unwrap();
  executor::block_on(conn.flush()).unwrap();
}

#[tokio::main]
async fn main() {
  let ws_stream = connect_websocket("ws://localhost:8080/ws".into()).await;
  println!("blop: websocket connected");

  // split websocket
  let (write, mut read) = ws_stream.split();

  tauri::Builder::default()
    // .manage::<WebSocketWrite>(WebSocketWrite(Mutex::from(write)))
    // .manage::<WebSocketRead>(WebSocketRead(Mutex::from(read)))
    .manage::<WebSocketState>(WebSocketState {
      write: Mutex::from(write),
    })
    .setup(|app| {
      let handle = app.handle();
      println!("spawning thread");
      thread::spawn(move || loop {
        executor::block_on(read.for_each(|message_result| async {
          let message = match message_result {
            Err(_) => return,
            Ok(x) => x,
          };
          let data = message.into_data();
          let str_data = std::str::from_utf8(&data).unwrap();
          println!("back in my day we'd have this payload delivered already!");
          handle
            .emit_all(
              "message",
              WSPayload {
                message: str_data.into(),
              },
            )
            .unwrap();
        }));
        println!("lost connection to websocket server");
        let state: State<WebSocketState> = handle.state();

        let new_ws_stream = connect_websocket("ws://localhost:8080/ws".into())
          .now_or_never()
          .unwrap();

        // let new_ws_stream = executor::block_on(connect_websocket("ws://localhost:8080/ws".into()));
        let (new_write, new_read) = new_ws_stream.split();
        read = new_read;

        let mut write = state.write.lock().unwrap();
        *write = new_write;

        println!("executor finished")
      });

      // let handler = tokio::spawn(read.for_each(|message| async {
      //   let data = message.unwrap().into_data();
      //   println!("{:?}", &data);
      //   let lock = app.state::<EventEmitLock>().0.lock();
      //   app.handle().emit_all(
      //     "message",
      //     WSPayload {
      //       // message: String::from(data),
      //       message: std::str::from_utf8(&data).unwrap().into(),
      //     },
      //   );
      //   drop(lock);
      // }));

      println!("blop: setup finished");
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![send_message])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

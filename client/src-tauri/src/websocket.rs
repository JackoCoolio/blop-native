use std::time::Duration;

use futures::{lock::Mutex, stream::SplitSink, StreamExt};
use tauri::{AppHandle, Manager, State};
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};
use url::Url;

use crate::{Config, WSPayload};

pub struct WebSocketState {
  pub write: Mutex<Option<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
}

pub struct PossibleWrite {
  pub write: Option<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>,
}

impl PossibleWrite {
  pub fn new(
    write: Option<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>,
  ) -> PossibleWrite {
    PossibleWrite { write }
  }
}

pub async fn connect_websocket(url: String) -> WebSocketStream<MaybeTlsStream<TcpStream>> {
  let ws_uri = Url::parse(&url).unwrap();

  let (ws_stream, _) = connect_async(ws_uri).await.expect("failed to connect");

  ws_stream
}

pub async fn try_connect(
  uri: String,
) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, String> {
  let ws_uri = Url::parse(&uri).unwrap();

  // todo: give up after some number of attempts
  loop {
    match connect_async(ws_uri.clone()).await {
      Err(_) => {
        tokio::time::sleep(Duration::from_secs(5)).await;
        continue;
      }
      Ok((ws_stream, _)) => {
        println!("reconnected");
        return Ok(ws_stream);
      }
    }
  }

  // Err("couldn't connect to WS server".into())
}

pub async fn listen(handle: AppHandle) {
  let state: State<WebSocketState> = handle.state();
  let config: State<Config> = handle.state();
  loop {
    println!("connecting to ws server...");
    // acquire write lock ASAP
    let mut write = state.write.lock().await;

    // try to connect again
    let new_ws_stream = match try_connect(config.ws_url.clone()).await {
      Err(e) => panic!("{}", e), // panic for now
      Ok(x) => x,
    };

    let (new_write, new_read) = new_ws_stream.split();

    // update websocket connection to use new stream/sink
    let read = new_read;
    *write = Some(new_write);

    // release lock
    drop(write);

    println!("ws server connected");

    // read from websocket stream until server sends close message
    read
      .for_each(|message_result| async {
        let message = match message_result {
          Err(_) => return,
          Ok(x) => x,
        };
        let data = message.into_data();
        let str_data = std::str::from_utf8(&data).unwrap();

        // emit message to frontend
        handle
          .emit_all(
            "message",
            WSPayload {
              message: str_data.into(),
            },
          )
          .expect("couldn't emit message"); // not sure how this would fail without needing to panic anyway
      })
      .await;

    println!("lost connection");
  }
}

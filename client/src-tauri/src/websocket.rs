use std::time::Duration;

use futures::{lock::Mutex, stream::SplitSink, SinkExt, StreamExt};
use tauri::{AppHandle, Manager, State};
use tokio::{net::TcpStream, time::Instant};
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};
use url::Url;

use crate::{
  events::{LatencyEventPayload, MessageEventPayload},
  Config,
};

pub struct Ping {
  sent_time: Instant,
  outstanding: bool,
}

impl Default for Ping {
  fn default() -> Self {
    Ping {
      sent_time: Instant::now(),
      outstanding: false,
    }
  }
}

pub struct WebSocketState {
  pub write: Mutex<Option<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>>,
  pub ping: Mutex<Ping>,
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
        println!("failed to connect. trying again in 5 seconds.");
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

/// Pings the server at a regular interval to remind the server that this connection is alive.
/// This function does not handle pongs.
pub async fn pinger(handle: AppHandle) -> ! {
  let state: State<WebSocketState> = handle.state();
  let config: State<Config> = handle.state();
  let interval = config.ping_interval;

  loop {
    tokio::time::sleep(Duration::from_secs(interval)).await;

    let mut ping = state.ping.lock().await;
    // don't send multiple pings
    if ping.outstanding {
      continue;
    }

    if !ping.outstanding {
      ping.sent_time = Instant::now();
      ping.outstanding = true;
    }

    let mut write_guard = state.write.lock().await;
    let write = match &mut *write_guard {
      Some(x) => x,
      None => {
        // if we haven't connected yet (write is None), wait
        continue;
      }
    };

    write
      .feed(Message::Ping(String::into_bytes(":)".into())))
      .await
      .unwrap();
    write.flush().await.unwrap();
  }
}

pub async fn listen(handle: AppHandle) {
  let state: State<WebSocketState> = handle.state();
  let config: State<Config> = handle.state();
  loop {
    println!("connecting to ws server...");
    // acquire write lock ASAP
    let mut write = state.write.lock().await;
    println!("write lock acquired");

    // try to connect again
    let new_ws_stream = match try_connect(config.ws_url.clone()).await {
      Err(e) => panic!("{}", e), // panic for now
      Ok(x) => x,
    };

    let (new_write, new_read) = new_ws_stream.split();

    // update websocket connection to use new stream/sink
    let read = new_read;
    *write = Some(new_write);
    println!("listen() releasing write lock");

    // release lock
    drop(write);

    println!("ws server connected");

    // read from websocket stream until server sends close message
    read
      .for_each(|message_result| async {
        let message = match message_result {
          Err(e) => {
            println!("error: {}", e);
            return;
          }
          Ok(x) => x,
        };

        if message.is_pong() {
          let mut ping = state.ping.lock().await;
          ping.outstanding = false;
          let latency = Instant::now() - ping.sent_time;
          handle
            .emit_all(
              "latency",
              LatencyEventPayload {
                latency: latency.as_millis() as u32,
              },
            )
            .unwrap();
          return;
        }

        let data = message.into_data();
        let str_data = std::str::from_utf8(&data).unwrap();

        // emit message to frontend
        handle
          .emit_all(
            "message",
            MessageEventPayload {
              message: str_data.into(),
            },
          )
          .expect("couldn't emit message"); // not sure how this would fail without needing to panic anyway
      })
      .await;

    println!("lost connection");
  }
}

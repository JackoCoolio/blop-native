use futures::{
  lock::Mutex,
  stream::{SplitSink, SplitStream},
  StreamExt,
};
use tokio::net::TcpStream;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};
use url::Url;

pub struct WebSocketState {
  pub write: Mutex<SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>>,
  pub read: Mutex<SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>>,
}

impl WebSocketState {
  pub async fn connect(url: String) -> WebSocketState {
    let ws_uri = Url::parse(&url).unwrap();

    let (ws_stream, _) = connect_async(ws_uri).await.expect("failed to connect");

    let (write, read) = ws_stream.split();

    WebSocketState {
      write: Mutex::from(write),
      read: Mutex::from(read),
    }
  }
}

pub async fn connect_websocket(url: String) -> WebSocketStream<MaybeTlsStream<TcpStream>> {
  let ws_uri = Url::parse(&url).unwrap();

  let (ws_stream, _) = connect_async(ws_uri).await.expect("failed to connect");

  ws_stream
}

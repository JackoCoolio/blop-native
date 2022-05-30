/// The payload that carries the current latency to the WebSocket server.
/// Should line up with the LatencyEventPayload interface defined in the frontend.
#[derive(Clone, serde::Serialize)]
pub struct LatencyEventPayload {
  pub latency: u32,
}

/// The payload that carries messages from the WebSocket server.
/// Should line up with the MessageEventPayload interface defined in the frontend.
#[derive(Clone, serde::Serialize)]
pub struct MessageEventPayload {
  pub message: String,
}

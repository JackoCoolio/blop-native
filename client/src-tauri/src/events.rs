use ts_rs::TS;

/// The payload that carries the current latency to the WebSocket server.
#[derive(Clone, serde::Serialize, TS)]
#[ts(export, export_to = "../src/events/Latency.d.ts")]
pub struct LatencyEventPayload {
  pub latency: u32,
}

/// The payload that carries messages from the WebSocket server.
#[derive(Clone, serde::Serialize, TS)]
#[ts(export, export_to = "../src/events/Message.d.ts")]
pub struct MessageEventPayload {
  pub message: String,
}

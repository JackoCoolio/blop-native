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

#[derive(Clone, serde::Serialize, TS)]
#[ts(export, export_to = "../src/events/Notification.d.ts")]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum NotificationEventPayload {
  LostConnection,
  Broadcast { message: String },
}

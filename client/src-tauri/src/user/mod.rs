use serde::Serialize;
use ts_rs::TS;

pub mod auth;

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/user.d.ts")]
pub struct User {
  id: String,
  name: String,
}

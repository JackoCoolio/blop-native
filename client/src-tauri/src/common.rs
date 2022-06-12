use serde::Deserialize;

/// The response body that we expect when we get a bad request status
#[derive(Deserialize)]
pub struct BadRequestResponseBody {
  /// The type of error
  #[serde(rename = "type")]
  pub typ: String,
}

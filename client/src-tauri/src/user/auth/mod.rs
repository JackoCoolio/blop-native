use serde::Serialize;

pub mod password;
pub mod username;

#[derive(Serialize)]
pub struct AuthenticationState {
  pub logged_in: bool,
}

impl Default for AuthenticationState {
  fn default() -> Self {
    AuthenticationState { logged_in: false }
  }
}

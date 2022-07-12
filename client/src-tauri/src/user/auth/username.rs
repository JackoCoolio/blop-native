use reqwest::{Client, StatusCode};
use serde::Serialize;
use serde_json::json;
use ts_rs::TS;

const SPECIAL_USERNAME_CHARS: &'static str = "-_";
const MIN_USERNAME_LENGTH: usize = 4;
const MAX_USERNAME_LENGTH: usize = 24;

/// Returns true if `c` is a valid character for a username.
fn is_valid_username_char(c: char) -> bool {
  c.is_ascii_alphanumeric() || SPECIAL_USERNAME_CHARS.contains(c)
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/error/username-validation.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum UsernameValidation {
  Valid,
  Invalid(UsernameCriteria),
}

impl UsernameValidation {
  /// Creates a new `PasswordValidation` struct.
  pub fn new(criteria: UsernameCriteria) -> UsernameValidation {
    if criteria.length && criteria.charset {
      UsernameValidation::Valid
    } else {
      UsernameValidation::Invalid(criteria)
    }
  }

  /// Returns `true` if this validation is `Valid`.
  #[inline]
  pub fn is_valid(&self) -> bool {
    matches!(*self, Self::Valid)
  }
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/error/validate-username.d.ts")]
pub struct UsernameCriteria {
  length: bool,
  charset: bool,
}

pub fn validate_username(username: &str) -> UsernameValidation {
  let mut criteria = UsernameCriteria {
    length: username.len() >= MIN_USERNAME_LENGTH && username.len() <= MAX_USERNAME_LENGTH,
    charset: true,
  };

  for c in username.chars() {
    if !is_valid_username_char(c) {
      criteria.charset = false;
    }
  }

  UsernameValidation::new(criteria)
}

/// Returns true if the user named `username` exists.
pub async fn user_exists(url: &str, username: &str) -> bool {
  if !validate_username(username).is_valid() {
    return false;
  }

  let body = json!({
    "username": username,
  });

  let out = match Client::new().get(url).json(&body).send().await {
    // fallback is that user doesn't exist
    Err(_) => false,
    Ok(x) => {
      if x.status() == StatusCode::OK {
        true
      } else {
        false
      }
    }
  };

  out
}

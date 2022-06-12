use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use ts_rs::TS;

use crate::{
  common::BadRequestResponseBody,
  user::auth::{
    password::{validate_password, PasswordCriteria, PasswordValidation},
    username::{validate_username, UsernameCriteria, UsernameValidation},
  },
};

pub mod auth;

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/create-user.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum CreateUserResult {
  Success(AuthenticationSuccessResponse),
  AlreadyLoggedIn,
  UsernameAlreadyExists,
  InvalidPassword(PasswordCriteria),
  InvalidUsername(UsernameCriteria),
}

#[derive(Deserialize, Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/auth/success-response.d.ts")]
pub struct AuthenticationSuccessResponse {
  pub id: String,
  pub token: String,
}

pub async fn create_user(username: String, password: String) -> Result<CreateUserResult, String> {
  // validate password, just in case
  if let PasswordValidation::Invalid(crit) = validate_password(&password) {
    return Ok(CreateUserResult::InvalidPassword(crit));
  }

  // validate username, just in case
  if let UsernameValidation::Invalid(crit) = validate_username(&username) {
    return Ok(CreateUserResult::InvalidUsername(crit));
  }

  // create request body
  let body = json!({
    "username": username,
    "password": password,
  });

  match Client::new()
    .post("http://localhost:8080/auth/create")
    .json(&body)
    .send()
    .await
  {
    // we got a response
    Ok(x) => {
      match x.status() {
        StatusCode::OK => match x.json::<AuthenticationSuccessResponse>().await {
          Ok(x) => Ok(CreateUserResult::Success(x)),
          Err(_) => Err("malformed server response".into()),
        },
        StatusCode::BAD_REQUEST => {
          // parse response body
          let body = match x.json::<BadRequestResponseBody>().await {
            Ok(x) => x,
            Err(_) => {
              return Err("malformed server response".into());
            }
          };

          // match reason for bad request response
          Err(
            match body.typ.as_str() {
              "JSON" => "invalid request",

              /*
              We have InvalidUsername/Password for these, but all of these errors are
              unexpected, i.e. we have checks that should prevent these errors from
              happening. We shouldn't rely on this step for useful error types.
              */
              "USERNAME" => "invalid username",
              "PASSWORD" => "invalid password",

              "DUPLICATE" => "user already exists",
              _ => "invalid server response",
            }
            .into(),
          )
        }
        _ => Err("invalid server response".into()),
      }
    }
    // we didn't get a response
    Err(e) => Err(e.to_string()),
  }
}

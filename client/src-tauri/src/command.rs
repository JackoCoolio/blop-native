use futures::SinkExt;
use reqwest::{Client, StatusCode};
use serde::Serialize;
use serde_json::json;
use tauri::State;
use ts_rs::TS;

use crate::{
  common::BadRequestResponseBody,
  user::{
    auth::{
      password::{validate_password as _validate_password, PasswordValidation},
      set_optional_mutex_value,
      username::{
        user_exists as _user_exists, validate_username as _validate_username, UsernameValidation,
      },
      AuthenticationState,
    },
    create_user as _create_user, AuthenticationSuccessResponse, CreateUserResult,
  },
  websocket::WebSocketState,
};

#[tauri::command]
pub fn validate_password(password: String) -> PasswordValidation {
  _validate_password(&password)
}

#[tauri::command]
pub fn validate_username(username: String) -> UsernameValidation {
  _validate_username(&username)
}

#[tauri::command]
pub async fn create_user(
  state: State<'_, AuthenticationState>,
  username: String,
  password: String,
) -> Result<CreateUserResult, String> {
  // can't log in while logged in
  if state.token.lock().await.is_logged_in() {
    return Ok(CreateUserResult::AlreadyLoggedIn);
  }

  let create_user_result = _create_user(username, password).await;

  match &create_user_result {
    Ok(x) => match x {
      CreateUserResult::Success(x) => {
        set_optional_mutex_value(&state.token, Some(x.token.clone())).await;
      }
      _ => (),
    },
    _ => (),
  };

  create_user_result
}

#[tauri::command]
pub async fn user_exists(username: String) -> bool {
  _user_exists(&username).await
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/auth/verify-token-result.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum VerifyTokenResult {
  NotLoggedIn,
  Authorized,
  Expired,
}

#[tauri::command]
pub async fn verify_token(
  state: State<'_, AuthenticationState>,
) -> Result<VerifyTokenResult, String> {
  let maybe_token = state.get_token().await;

  match maybe_token {
    None => Ok(VerifyTokenResult::NotLoggedIn),
    Some(token) => {
      match Client::new()
        .get("http://localhost:8080/auth/verify")
        .bearer_auth(token)
        .send()
        .await
      {
        Err(_) => Err("couldn't verify token".into()),
        Ok(x) => match x.status() {
          StatusCode::OK => Ok(VerifyTokenResult::Authorized),
          StatusCode::BAD_REQUEST => Err("malformed token".into()),
          StatusCode::UNAUTHORIZED => {
            AuthenticationState::logout(&state).await;
            Ok(VerifyTokenResult::Expired)
          }
          _ => Err("invalid server response".into()),
        },
      }
    }
  }
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/auth/login-result.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum LoginResult {
  Authorized,
  Unauthorized,
  UserDoesNotExist,
}

#[tauri::command]
pub async fn log_in(
  state: State<'_, AuthenticationState>,
  username: String,
  password: String,
) -> Result<LoginResult, String> {
  let request_body = json!({
    "username": username,
    "password": password,
  });

  match Client::new()
    .get("http://localhost:8080/auth/login")
    .json(&request_body)
    .send()
    .await
  {
    // we couldn't connect
    Err(e) => Err(format!("couldn't log in! {}", e.to_string())),
    Ok(x) => match x.status() {
      StatusCode::OK => {
        // parse response body
        let body: AuthenticationSuccessResponse = match x.json().await {
          Err(_) => return Err("invalid server response (c5d3)".into()),
          Ok(x) => x,
        };

        // update token and ID
        AuthenticationState::login(&state, body.token, body.id).await;

        Ok(LoginResult::Authorized)
      }
      // invalid credentials
      StatusCode::UNAUTHORIZED => Ok(LoginResult::Unauthorized),
      StatusCode::BAD_REQUEST => {
        // parse the bad request response
        // we expect a field that contains the specific type
        let body: BadRequestResponseBody = match x.json().await {
          Err(_) => return Err("invalid server response (1908)".into()),
          Ok(x) => x,
        };

        // match expected types
        match body.typ.as_str() {
          "USER" => Ok(LoginResult::UserDoesNotExist),
          other => Err(format!("invalid server response (7c63): {}", other)),
        }
      }
      other => Err(format!(
        "authorization error {}",
        other.canonical_reason().unwrap()
      )),
    },
  }
}

#[tauri::command]
pub async fn send_message(state: State<'_, WebSocketState>, message: String) -> Result<(), String> {
  let mut guard = state.write.lock().await;

  // unwrap option inside MutexGuard
  let conn = match &mut *guard {
    Some(x) => x,
    None => return Err("not connected to WebSocket server".into()),
  };

  conn.feed(message.into()).await.map_err(|e| e.to_string())?;
  conn.flush().await.map_err(|e| e.to_string())?;

  Ok(())
}

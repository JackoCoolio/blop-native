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
    create_user as _create_user, AuthenticationSuccessResponse, CreateUserResult, User,
  },
  websocket::WebSocketState,
  Config,
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
  auth_state: State<'_, AuthenticationState>,
  config_state: State<'_, Config>,
  username: String,
  password: String,
) -> Result<CreateUserResult, String> {
  // can't log in while logged in
  if auth_state.token.lock().await.is_logged_in() {
    return Ok(CreateUserResult::AlreadyLoggedIn);
  }

  let create_user_result = _create_user(
    &config_state.get_api_url("/auth/create"),
    username,
    password,
  )
  .await;

  match &create_user_result {
    Ok(x) => match x {
      CreateUserResult::Success(x) => {
        set_optional_mutex_value(&auth_state.token, Some(x.token.clone())).await;
      }
      _ => (),
    },
    _ => (),
  };

  create_user_result
}

#[tauri::command]
pub async fn user_exists(
  config_state: State<'_, Config>,
  username: String,
) -> Result<bool, String> {
  // TODO: don't just Ok this
  Ok(_user_exists(&config_state.get_api_url("/user/getid"), &username).await)
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
  auth_state: State<'_, AuthenticationState>,
  config_state: State<'_, Config>,
) -> Result<VerifyTokenResult, String> {
  let maybe_token = auth_state.get_token().await;

  match maybe_token {
    None => Ok(VerifyTokenResult::NotLoggedIn),
    Some(token) => {
      match Client::new()
        .get(config_state.get_api_url("/auth/verify"))
        .bearer_auth(token)
        .send()
        .await
      {
        Err(_) => Err("couldn't verify token".into()),
        Ok(x) => match x.status() {
          StatusCode::OK => Ok(VerifyTokenResult::Authorized),
          StatusCode::BAD_REQUEST => Err("malformed token".into()),
          StatusCode::UNAUTHORIZED => {
            AuthenticationState::logout(&auth_state).await;
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
  auth_state: State<'_, AuthenticationState>,
  config_state: State<'_, Config>,
  username: String,
  password: String,
) -> Result<LoginResult, String> {
  let request_body = json!({
    "username": username,
    "password": password,
  });

  match Client::new()
    .get(config_state.get_api_url("/auth/login"))
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
        AuthenticationState::login(&auth_state, body.token, body.id).await;

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

#[derive(Serialize, TS)]
#[ts(export, export_to = "../src/types/user/info.d.ts")]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum MyInfoResult {
  Success(User),
  NotLoggedIn,
}

#[tauri::command]
pub async fn my_info(
  auth_state: State<'_, AuthenticationState>,
  config_state: State<'_, Config>,
) -> Result<MyInfoResult, String> {
  // TODO: figure out locks here. maybe rework/replace optionalstate
  let token = match auth_state.get_token().await {
    None => {
      AuthenticationState::logout(&auth_state).await;
      return Ok(MyInfoResult::NotLoggedIn);
    }
    Some(x) => x,
  };

  // TODO: don't unwrap. this is bad
  let resp = Client::new()
    .get(config_state.get_api_url("/user/me"))
    .bearer_auth(token)
    .send()
    .await
    .unwrap();

  match resp.status() {
    StatusCode::OK => {
      let body: User = match resp.json().await {
        Err(_) => return Err("invalid server response (c5d3)".into()),
        Ok(x) => x,
      };

      Ok(MyInfoResult::Success(body))
    }
    other => Err(format!(
      "authorization error {}",
      other.canonical_reason().unwrap()
    )),
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

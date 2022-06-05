use futures::SinkExt;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;
use ts_rs::TS;

use crate::{
  user::auth::{
    password::{validate_password as _validate_password, PasswordCriteria, PasswordValidation},
    username::{
      user_exists as _user_exists, validate_username as _validate_username, UsernameCriteria,
      UsernameValidation,
    },
    AuthenticationState,
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

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/error/create-user.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum CreateUserReturnType {
  Success,
  AlreadyLoggedIn,
  UsernameAlreadyExists,
  InvalidPassword(PasswordCriteria),
  InvalidUsername(UsernameCriteria),
}

#[derive(Deserialize)]
struct CreateUserErrorResponseBody {
  r#type: String,
}

#[tauri::command]
pub async fn create_user(
  state: State<'_, AuthenticationState>,
  username: String,
  password: String,
) -> Result<CreateUserReturnType, String> {
  println!("create_user()");
  // can't log in while logged in
  if state.logged_in {
    return Ok(CreateUserReturnType::AlreadyLoggedIn);
  }

  // validate password, just in case
  if let PasswordValidation::Invalid(crit) = _validate_password(&password) {
    return Ok(CreateUserReturnType::InvalidPassword(crit));
  }

  // validate username, just in case
  if let UsernameValidation::Invalid(crit) = _validate_username(&username) {
    return Ok(CreateUserReturnType::InvalidUsername(crit));
  }

  println!("validated");

  // create request body
  let body = json!({
    "username": username,
    "password": password,
  });
  // println!("{}", body.as_str().unwrap());

  match Client::new()
    .post("http://localhost:8080/auth/create")
    .json(&body)
    .send()
    .await
  {
    // we got a response
    Ok(x) => {
      println!("got response");
      if x.status() == StatusCode::OK {
        println!("ok!");
        Ok(CreateUserReturnType::Success)
      } else if x.status() == StatusCode::BAD_REQUEST {
        println!("bad request");
        // parse response body
        let body = match x.json::<CreateUserErrorResponseBody>().await {
          Ok(x) => x,
          Err(_) => {
            return Err("internal: invalid server response".into());
          }
        };

        // match reason for bad request response
        if body.r#type == "JSON" {
          Err("internal: invalid request".into())
        } else if body.r#type == "USERNAME" {
          Err("internal: invalid username".into())
        } else if body.r#type == "PASSWORD" {
          Err("internal: invalid password".into())
        } else if body.r#type == "DUPLICATE" {
          Err("internal: user already exists".into())
        } else {
          Err("internal: invalid server response".into())
        }
      } else {
        Err("internal: invalid server response".into())
      }
    }
    // we didn't get a response
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
pub async fn user_exists(username: String) -> bool {
  _user_exists(&username).await
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

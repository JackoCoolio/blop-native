use futures::lock::Mutex;

pub mod password;
pub mod username;

pub trait OptionalState<T> {
  fn get(&self) -> Option<T>;
  fn set(&mut self, value: Option<T>) -> ();
}

/*
Unwrapping a Mutex<Option<T>> is cumbersome, but unwrapping a Mutex
of a struct that contains an Option<T> is easy.
 */

pub struct TokenState {
  pub token: Option<String>,
}

impl TokenState {
  pub fn is_logged_in(&self) -> bool {
    self.token.is_some()
  }
}

impl OptionalState<String> for TokenState {
  fn get(&self) -> Option<String> {
    self.token.clone()
  }

  fn set(&mut self, value: Option<String>) -> () {
    self.token = value;
  }
}

pub struct UserIdState {
  pub user_id: Option<String>,
}

impl OptionalState<String> for UserIdState {
  fn get(&self) -> Option<String> {
    self.user_id.clone()
  }

  fn set(&mut self, value: Option<String>) -> () {
    self.user_id = value;
  }
}

/// Contains state related to the currently logged in user.
pub struct AuthenticationState {
  pub token: Mutex<TokenState>,
  pub user_id: Mutex<UserIdState>,
}

impl AuthenticationState {
  /// Returns a copy of the JWT. This function acquires the lock and releases it.
  pub async fn get_token(&self) -> Option<String> {
    self.token.lock().await.token.clone()
  }

  /// Returns a copy of the user ID.
  pub async fn get_user_id(&self) -> Option<String> {
    self.user_id.lock().await.user_id.clone()
  }

  /// Sets the token and user ID of the given state to None.
  pub async fn logout(state: &Self) -> () {
    set_optional_mutex_value(&state.token, None).await;
    set_optional_mutex_value(&state.user_id, None).await;
  }

  /// Sets the token and user ID.
  pub async fn login(state: &Self, token: String, user_id: String) -> () {
    set_optional_mutex_value(&state.token, Some(token)).await;
    set_optional_mutex_value(&state.user_id, Some(user_id)).await;
  }
}

impl Default for AuthenticationState {
  fn default() -> Self {
    AuthenticationState {
      token: Mutex::from(TokenState { token: None }),
      user_id: Mutex::from(UserIdState { user_id: None }),
    }
  }
}

/// Acquires
pub async fn get_optional_mutex_value<O, T>(mutex: Mutex<O>) -> Option<T>
where
  O: OptionalState<T>,
{
  mutex.lock().await.get()
}

pub async fn set_optional_mutex_value<O, T>(mutex: &Mutex<O>, value: Option<T>) -> ()
where
  O: OptionalState<T>,
{
  mutex.lock().await.set(value);
}

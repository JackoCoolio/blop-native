use serde::Serialize;
use ts_rs::TS;

const SPECIAL_PASSWORD_CHARS: &'static str = "~!@#$%^&*()_+~`! @#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
const MIN_PASSWORD_LENGTH: usize = 8;
const MAX_PASSWORD_LENGTH: usize = 512; // if your password is longer than 512 characters, sorry

/// Returns true if `c` is a valid character for a password.
fn is_valid_password_char(c: char) -> bool {
  c.is_ascii_alphanumeric() || SPECIAL_PASSWORD_CHARS.contains(c)
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/error/password-validation.d.ts")]
#[serde(rename_all = "camelCase", tag = "result")]
pub enum PasswordValidation {
  Valid,
  Invalid(PasswordCriteria),
}

impl PasswordValidation {
  /// Creates a new `PasswordValidation` struct.
  pub fn new(criteria: PasswordCriteria) -> PasswordValidation {
    if criteria.charset
      && criteria.length
      && criteria.alpha
      && criteria.digit
      && criteria.upper
      && criteria.lower
      && criteria.special
    {
      PasswordValidation::Valid
    } else {
      PasswordValidation::Invalid(criteria)
    }
  }

  /// Returns `true` if this validation is `Valid`.
  #[inline]
  pub fn is_valid(&self) -> bool {
    matches!(*self, Self::Valid)
  }
}

#[derive(Clone, TS, Serialize)]
#[ts(export, export_to = "../src/types/user/error/validate-password.d.ts")]
pub struct PasswordCriteria {
  charset: bool,
  length: bool,
  alpha: bool,
  digit: bool,
  upper: bool,
  lower: bool,
  special: bool,
}

/// Returns the validation for `password`.
pub fn validate_password(password: &str) -> PasswordValidation {
  let mut criteria = PasswordCriteria {
    upper: false,
    lower: false,
    alpha: false,
    charset: true,
    digit: false,
    length: password.len() >= MIN_PASSWORD_LENGTH && password.len() <= MAX_PASSWORD_LENGTH,
    special: false,
  };

  for c in password.chars() {
    if !is_valid_password_char(c) {
      criteria.charset = false;
    }

    if c.is_ascii_uppercase() {
      criteria.upper = true;
    }

    if c.is_ascii_lowercase() {
      criteria.lower = true;
    }

    if c.is_numeric() {
      criteria.digit = true;
    }

    if c.is_alphabetic() {
      criteria.alpha = true;
    }

    if SPECIAL_PASSWORD_CHARS.contains(c) {
      criteria.special = true;
    }
  }

  PasswordValidation::new(criteria)
}

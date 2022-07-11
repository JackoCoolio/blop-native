import { invoke } from "@tauri-apps/api"
import { LoginResult } from "../types/auth/login-result"
import { VerifyTokenResult } from "../types/auth/verify-token-result"
import { CreateUserResult } from "../types/user/create-user"
import { PasswordValidation } from "../types/user/error/password-validation"
import { UsernameValidation } from "../types/user/error/username-validation"
import { MyInfoResult } from "../types/user/info"

/**
 * Sends a message to the WebSocket server.
 * @param message the message to send
 * @returns an error if the websocket server isn't connected
 */
export async function sendMessage(message: string): Promise<void> {
  return await invoke("send_message", { message })
}

/**
 * Returns the validation for `password`.
 * @param password the password
 * @returns the criteria for the password
 */
export async function validatePassword(
  password: string,
): Promise<PasswordValidation> {
  return await invoke("validate_password", { password })
}

/**
 * Returns the validation for `username`.
 * @param username the username
 * @returns the criteria for the username
 */
export async function validateUsername(
  username: string,
): Promise<UsernameValidation> {
  return await invoke("validate_username", { username })
}

/**
 * Attempts to create a new user with the given username and password.
 * @param username the new username
 * @param password the new password
 * @returns the result of creating the user
 */
export async function createUser(
  username: string,
  password: string,
): Promise<CreateUserResult> {
  return await invoke("create_user", { username, password })
}

/**
 * Attempts to log in with the given username and password.
 * @param username the username
 * @param password the password
 * @returns the result of attempting to log in
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  return await invoke("log_in", { username, password })
}

/**
 * Asks the server to validate our token.
 * @returns a result of type notLoggedIn, authorized, or expired
 */
export async function verifyToken(): Promise<VerifyTokenResult> {
  return await invoke("verify_token")
}

/**
 * Queries the database for a user with the given username and returns whether or not the user exists.
 * @param username the username
 * @returns whether or not the user exists
 */
export async function userExists(username: string): Promise<boolean> {
  return await invoke("user_exists", { username })
}

/**
 * Gets information about the current user if it is cached, otherwise queries the database.
 * @returns information about the user
 */
export async function myInfo(): Promise<MyInfoResult> {
  return await invoke("my_info")
}

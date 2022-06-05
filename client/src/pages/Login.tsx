import { Link } from "solid-app-router"
import { Component, createSignal } from "solid-js"
import { createUser, validatePassword, validateUsername } from "../lib/commands"
import { PasswordValidation } from "../types/user/error/password-validation"
import { UsernameValidation } from "../types/user/error/username-validation"

const Login: Component = () => {
  const [username, setUsername] = createSignal<string>("")
  const [password, setPassword] = createSignal<string>("")

  const [usernameValidation, setUsernameValidation] =
    createSignal<UsernameValidation>({
      result: "invalid",
      length: false,
      charset: true,
    })

  const [passwordValidation, setPasswordValidation] =
    createSignal<PasswordValidation>({
      result: "invalid",
      length: false,
      alpha: false,
      upper: false,
      lower: false,
      charset: true,
      digit: false,
      special: false,
    })

  return (
    <div>
      <Link href="/">Go home</Link>
      <p>Log in</p>
      <p>Username</p>
      <input
        type="text"
        onInput={async (e) => {
          const value = e.currentTarget.value

          setUsernameValidation(await validateUsername(value))
          setUsername(value)
        }}
      ></input>
      <span>{JSON.stringify(usernameValidation())}</span>
      <p>Password</p>
      <input
        type="text"
        onInput={async (e) => {
          const value = e.currentTarget.value

          setPasswordValidation(await validatePassword(value))
          setPassword(value)
        }}
      ></input>
      <span>{JSON.stringify(passwordValidation())}</span>
      <button
        onClick={async () => {
          const out = await createUser(username(), password())
        }}
      >
        Submit
      </button>
      <span>{username()}</span>
    </div>
  )
}

export default Login

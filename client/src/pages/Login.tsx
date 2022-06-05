import { Link } from "solid-app-router"
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js"
import {
  createUser,
  userExists,
  validatePassword,
  validateUsername,
} from "../lib/commands"
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

  const [doesUserExist, setUserExists] = createSignal<boolean>(false)

  let previousUsername: string = undefined
  const userExistsTimer = setInterval(async () => {
    // don't bother fetching invalid usernames
    if (usernameValidation().result == "invalid") {
      return setUserExists(false)
    }

    if (username() != previousUsername) {
      previousUsername = username()
      setUserExists(await userExists(username()))
    } else {
    }
  }, 1000)

  // clean up interval
  onCleanup(() => clearInterval(userExistsTimer))

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
      <span>{doesUserExist().toString()}</span>
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
          console.log(out)
        }}
      >
        Submit
      </button>
      <span>{username()}</span>
    </div>
  )
}

export default Login

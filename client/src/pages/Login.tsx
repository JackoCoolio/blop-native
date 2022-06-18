import { Link } from "solid-app-router"
import { Component, createSignal, onCleanup } from "solid-js"
import {
  createUser,
  login,
  userExists,
  validatePassword,
  validateUsername,
  verifyToken,
} from "../lib/commands"
import { PasswordValidation } from "../types/user/error/password-validation"
import { UsernameValidation } from "../types/user/error/username-validation"

const Login: Component = () => {
  const [creationUsername, setCreationUsername] = createSignal<string>("")
  const [creationPassword, setCreationPassword] = createSignal<string>("")

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

  const [verifyResponse, setVerifyResponse] = createSignal<string>("?")

  let previousUsername: string | undefined = undefined
  const userExistsTimer = setInterval(async () => {
    // don't bother fetching invalid usernames
    if (usernameValidation().result == "invalid") {
      return setUserExists(false)
    }

    if (creationUsername() != previousUsername) {
      previousUsername = creationUsername()
      setUserExists(await userExists(creationUsername()))
    } else {
    }
  }, 1000)

  // clean up interval
  onCleanup(() => clearInterval(userExistsTimer))

  let loginUsernameField: Ref<HTMLInputElement>
  let loginPasswordField: Ref<HTMLInputElement>

  return (
    <div>
      <Link href="/">Go home</Link>
      <div>
        <p>Sign up</p>
        <p>Username</p>
        <input
          type="text"
          onInput={async (e) => {
            const value = e.currentTarget.value

            setUsernameValidation(await validateUsername(value))
            setCreationUsername(value)
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
            setCreationPassword(value)
          }}
        ></input>
        <span>{JSON.stringify(passwordValidation())}</span>
        <button
          onClick={async () => {
            const out = await createUser(creationUsername(), creationPassword())
            console.log(out)
          }}
        >
          Submit
        </button>
        <span>{creationUsername()}</span>
      </div>
      <div>
        <p>Log in</p>
        <p>Username</p>
        <input type="text" ref={loginUsernameField} />
        <p>Password</p>
        <input type="text" ref={loginPasswordField} />
        <button
          onClick={async () => {
            const out = await login(
              loginUsernameField!.value,
              loginPasswordField!.value,
            )
            console.log(out)
          }}
        >
          Submit
        </button>
      </div>
      <div>
        <button
          onClick={async () => {
            const response = await verifyToken()
            setVerifyResponse(response.result)
          }}
        >
          Verify Token
        </button>
        <p>{verifyResponse()}</p>
      </div>
    </div>
  )
}

export default Login

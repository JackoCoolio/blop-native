import { Component, createMemo, createSignal, onCleanup } from "solid-js"
import { useTheme } from "../components/ThemeProvider"
import { userExists, validatePassword, validateUsername } from "../lib/commands"
import { PasswordValidation } from "../types/user/error/password-validation"
import { UsernameValidation } from "../types/user/error/username-validation"

/** How long we wait before assuming that the user has stopped typing. */
const USER_EXISTS_COOLDOWN: number = 200

const Register: Component = () => {
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

  // refs
  let usernameInputRef: Ref<HTMLInputElement>
  let passwordInputRef: Ref<HTMLInputElement>

  // timer that fires whenever the user stops typing
  let userExistsTimer: number | undefined
  onCleanup(() => clearTimeout(userExistsTimer))

  const [_, { chooseTheme }] = useTheme()

  return (
    <div class="w-full h-full">
      <button
        onClick={() => {
          chooseTheme("classic")
        }}
      >
        Classic
      </button>
      <button
        onClick={() => {
          chooseTheme("new")
        }}
      >
        Light
      </button>
      <div class="mx-auto w-1/2 flex flex-col justify-start items-start">
        <table>
          <tbody>
            <tr>
              <td>
                <h1>Log in</h1>
              </td>
            </tr>
            <tr>
              <td>
                <h2 class="mr-3">Username:</h2>
              </td>
              <td colspan={2}>
                <input
                  type="text"
                  onInput={async (e) => {
                    const value = e.currentTarget.value
                    setUsernameValidation(await validateUsername(value))
                    setTimeout(async () => {
                      setUserExists(await userExists(usernameInputRef!.value))
                    }, USER_EXISTS_COOLDOWN)
                  }}
                  ref={usernameInputRef}
                />
              </td>
              <td>
                {usernameValidation().result === "valid" && !doesUserExist()
                  ? "good"
                  : "bad"}
              </td>
            </tr>
            <tr>
              <td>
                <h2 class="mr-3">Password:</h2>
              </td>
              <td colspan={2}>
                <input
                  type="password"
                  onInput={async (e) => {
                    const value = e.currentTarget.value
                    setPasswordValidation(await validatePassword(value))
                  }}
                  ref={passwordInputRef}
                />
              </td>
              <td>
                {passwordValidation().result === "valid" ? "good" : "bad"}
              </td>
            </tr>
            <tr>
              <td />
              <td />
              <td class="text-right">
                <button class="text-dark">Submit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Register

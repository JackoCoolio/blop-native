import {
  batch,
  Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js"
import Button from "../components/Button"
import Input from "../components/Input"
import {
  createUser,
  login,
  userExists,
  validatePassword,
  validateUsername,
} from "../lib/commands"
import { PasswordValidation } from "../types/user/error/password-validation"
import { UsernameValidation } from "../types/user/error/username-validation"

import PlusIcon from "../assets/plus.svg"
import ProfileIcon from "../assets/profile.svg"
import CheckIcon from "../assets/check.svg"

/** How long we wait before assuming that the user has stopped typing. */
const USER_TYPING_COOLDOWN = 600

const AuthorizationPage: Component = () => {
  return (
    <div
      id="authorization-page"
      class="flex flex-row flex-wrap h-full justify-evenly overflow-y-auto"
    >
      <LoginSection />
      <div class="h-9/10 w-1px bg-$light-background my-auto"></div>
      <RegisterSection />
    </div>
  )
}

const LoginSection: Component = () => {
  const [usernameValid, setUsernameValid] = createSignal(false)
  const [passwordValid, setPasswordValid] = createSignal(false)

  const [username, setUsername] = createSignal("")
  const [password, setPassword] = createSignal("")

  const submitHandler = async () => {
    await login(username(), password())
  }

  return (
    <div class="flex flex-col flex-start items-center mt-40px">
      <div class="flex flex-row w-fit">
        <ProfileIcon class="w-100px h-100px fill-$text mb-20px" />
      </div>
      <h1 class="mb-20px text-size-32pt">Log in</h1>
      <p>Forgot your password? Good luck with that, for the time being.</p>
      <div class="mx-auto mt-30px w-400px flex flex-col justify-start items-end relative">
        <Input
          color="alpha"
          label="username"
          placeholder="your username"
          spellcheck={false}
          onInput={(e) =>
            batch(() => {
              setUsernameValid(e.currentTarget.value.length >= 4)
              setUsername(e.currentTarget.value)
            })
          }
          class="mb-20px"
        />
        <Input
          color="beta"
          label="password"
          placeholder="your password"
          spellcheck={false}
          onInput={(e) =>
            batch(() => {
              setPasswordValid(e.currentTarget.value.length >= 8)
              setPassword(e.currentTarget.value)
            })
          }
          onEnter={submitHandler}
          password
          class="mb-20px"
        />
        <Button
          color="gamma"
          text="Log in"
          icon={{ elt: CheckIcon }}
          enabled={usernameValid() && passwordValid()}
          onClick={submitHandler}
        />
      </div>
    </div>
  )
}

const RegisterSection: Component = () => {
  const [enabled, setEnabled] = createSignal(false)

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

  const [confirmMatches, setConfirmMatches] = createSignal(false)

  const [username, setUsername] = createSignal("")
  const [password, setPassword] = createSignal("")

  const confirmPasswordRef: Ref<typeof Input> = undefined

  // timer that fires whenever the user stops typing
  let userExistsTimer: number | undefined
  onCleanup(() => clearTimeout(userExistsTimer))

  const handleCreateUser = async () => {
    if (enabled()) await createUser(username(), password())
  }

  // after validation changes, recompute button enabled state
  createEffect(async () => {
    if (
      usernameValidation().result === "valid" &&
      passwordValidation().result === "valid" &&
      confirmMatches() &&
      !(await userExists(username()))
    ) {
      setEnabled(true)
    } else {
      setEnabled(false)
    }
  })

  return (
    <div class="flex flex-col flex-start items-center mt-40px">
      <div class="flex flex-row w-fit">
        <PlusIcon class="w-100px h-100px fill-$text mb-20px" />
      </div>
      <h1 class="mb-20px text-size-32pt">Create a new account</h1>
      <p class="text-center">
        You'll be able to change all of this information later (once I implement
        the functionality to do so).
      </p>
      <div class="mx-auto mt-30px max-w-1/2 w-400px flex flex-col justify-start items-end relative">
        <Input
          class="mb-20px"
          color="alpha"
          label="username"
          placeholder="your username here"
          spellcheck={false}
          onInput={() => setEnabled(false)}
          validate={async (value) => {
            const valid = await validateUsername(value)
            batch(() => {
              setUsername(value)
              setUsernameValidation(valid)
            })
            const exists = await userExists(value)
            return exists ? "invalid" : valid.result
          }}
          validateDelay={USER_TYPING_COOLDOWN}
          tooltips={{
            invalid: {
              content: (() => {
                const validation = usernameValidation()
                if (validation.result === "valid") return null
                return (
                  <div>
                    Usernames must:
                    <ul class="list-circle list-inside">
                      <li
                        class={
                          validation.charset && username().length > 0
                            ? "opacity-30"
                            : ""
                        }
                      >
                        be alphanumeric
                      </li>
                      <li class={validation.length ? "opacity-30" : ""}>
                        be between 4 and 16 characters long
                      </li>
                    </ul>
                  </div>
                )
              })(),
              visibility: "hover",
            },
          }}
        />
        <Input
          class="mb-20px"
          color="beta"
          label="password"
          placeholder="your password here"
          password
          spellcheck={false}
          onInput={() => setEnabled(false)}
          validate={async (value) => {
            const valid = await validatePassword(value)
            batch(() => {
              setPassword(value)
              setPasswordValidation(valid)
            })
            return valid.result
          }}
          tooltips={{
            invalid: {
              content: (() => {
                const validation = passwordValidation()
                if (validation.result === "valid") return // this is impossible, but needed for type inference
                return (
                  <div>
                    Passwords must:
                    <ul class="list-circle list-inside">
                      <li
                        class={
                          validation.charset && password().length > 0
                            ? "opacity-30"
                            : ""
                        }
                      >
                        be alphanumeric with symbols
                      </li>
                      <li class={validation.length ? "opacity-30" : ""}>
                        be at least 8 characters
                      </li>
                      <li class={validation.upper ? "opacity-30" : ""}>
                        have an uppercase letter
                      </li>
                      <li class={validation.lower ? "opacity-30" : ""}>
                        have a lowercase letter
                      </li>
                      <li class={validation.digit ? "opacity-30" : ""}>
                        have a digit
                      </li>
                      <li class={validation.special ? "opacity-30" : ""}>
                        have a symbol
                      </li>
                    </ul>
                  </div>
                )
              })(),
              visibility: "hover",
            },
          }}
          validateDelay={600}
        />
        <Input
          ref={confirmPasswordRef}
          class="mb-20px"
          color="delta"
          label="confirm password"
          placeholder="retype your password"
          password
          spellcheck={false}
          onEnter={handleCreateUser}
          onInput={() => setEnabled(false)}
          validate={async (value) => {
            if (value === password() && value !== "") {
              setConfirmMatches(true)
              return "valid"
            }
            setConfirmMatches(false)
            if (value === "") {
              return "unknown"
            }
            return "invalid"
          }}
          tooltips={{
            invalid: {
              content: (
                <div>Your password and confirmed password don't match!</div>
              ),
              visibility: "hover",
            },
          }}
        />
        <Button
          text="Sign up"
          color="gamma"
          icon={{
            elt: CheckIcon,
          }}
          enabled={enabled()}
          onClick={handleCreateUser}
        />
      </div>
    </div>
  )
}

export default AuthorizationPage

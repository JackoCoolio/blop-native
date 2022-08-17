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
import { useNavigate, useSearchParams } from "solid-app-router"
import { createLengthValidator } from "../components/Input/validator"

/** How long we wait before assuming that the user has stopped typing. */
const USER_TYPING_COOLDOWN = 600

type Props = {
  redirect?: string
}

const AuthorizationPage: Component<Props> = ({ redirect }) => {
  const [params] = useSearchParams()

  // if redirect is a query param, use that
  // we should never have both a redirect query param and a redirect prop at the same time
  if (params.redirect) {
    redirect = params.redirect
  }

  return (
    <div
      id="authorization-page"
      class="flex flex-row flex-wrap h-full justify-evenly overflow-y-auto"
    >
      <LoginSection redirect={redirect} />
      <div class="h-9/10 w-1px bg-$light-background my-auto"></div>
      <RegisterSection redirect={redirect} />
    </div>
  )
}

const LoginSection: Component<Props> = ({ redirect }) => {
  const [usernameValid, setUsernameValid] = createSignal(false)
  const [passwordValid, setPasswordValid] = createSignal(false)

  const [username, setUsername] = createSignal("")
  const [password, setPassword] = createSignal("")

  const navigate = useNavigate()

  const submitHandler = async () => {
    const result = await login(username(), password())
    if (result.result === "authorized") {
      navigate(redirect ?? "/", { resolve: false })
    }
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
          validators={[createLengthValidator(4, 16)]}
          onAfterValidate={(valid) => setUsernameValid(valid === "valid")}
          hideValidation
          onInput={(e) => setUsername(e.currentTarget.value)}
          class="mb-20px"
        />
        <Input
          color="beta"
          label="password"
          placeholder="your password"
          spellcheck={false}
          validators={[createLengthValidator(8, null)]}
          hideValidation
          onAfterValidate={(result) => {
            setPasswordValid(result === "valid")
          }}
          onInput={(e) => setPassword(e.currentTarget.value)}
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

const RegisterSection: Component<Props> = ({ redirect }) => {
  const [enabled, setEnabled] = createSignal(false)

  const [usernameValidation, setUsernameValidation] =
    createSignal<UsernameValidation>({
      result: "invalid",
      length: false,
      charset: true,
    })
  const [usernameIsUnique, setUsernameIsUnique] = createSignal(true)

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

  // timer that fires whenever the user stops typing
  let userExistsTimer: number | undefined
  onCleanup(() => clearTimeout(userExistsTimer))

  const navigate = useNavigate()

  const handleCreateUser = async () => {
    if (enabled()) {
      const result = await createUser(username(), password())
      if (result.result === "success") {
        navigate(redirect ?? "/", { resolve: false })
      }
    }
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
          validators={[
            async (value) => {
              const valid = await validateUsername(value)
              const unique = !(await userExists(value))

              console.log({ valid, unique })

              batch(() => {
                setUsername(value)
                setUsernameValidation(valid)
                setUsernameIsUnique(unique)
              })

              return !unique ? "invalid" : valid.result
            },
          ]}
          validateDelay={USER_TYPING_COOLDOWN}
          tooltips={{
            invalid: {
              content: (() => {
                const validation = usernameValidation()
                const _usernameIsUnique = usernameIsUnique()
                if (validation.result === "valid" && _usernameIsUnique)
                  return null

                return (
                  <div>
                    Your username must:
                    <ul class="list-circle list-inside">
                      <li
                        class={
                          validation.result === "valid" ||
                          (validation.charset && username().length > 0)
                            ? "opacity-30"
                            : ""
                        }
                      >
                        be alphanumeric
                      </li>
                      <li
                        class={
                          validation.result === "valid" || validation.length
                            ? "opacity-30"
                            : ""
                        }
                      >
                        be between 4 and 16 characters long
                      </li>
                      <li class={_usernameIsUnique ? "opacity-30" : ""}>
                        be unique
                      </li>
                    </ul>
                  </div>
                )
              })(),
              visibility: { type: "hover", delay: 0 },
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
          validators={[
            async (value) => {
              const valid = await validatePassword(value)
              batch(() => {
                console.log({ value, valid })
                setPassword(value)
                setPasswordValidation(valid)
              })
              return valid.result
            },
          ]}
          tooltips={{
            invalid: {
              content: (() => {
                const validation = passwordValidation()
                console.log({ validation })
                if (validation.result === "valid") return // this is impossible, but needed for type inference
                return (
                  <div>
                    Your password must:
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
              visibility: { type: "hover", delay: 0 },
            },
          }}
          validateDelay={600}
        />
        <Input
          class="mb-20px"
          color="delta"
          label="confirm password"
          placeholder="retype your password"
          password
          spellcheck={false}
          onEnter={handleCreateUser}
          onInput={() => setEnabled(false)}
          validators={[
            async (value) => {
              if (value === password() && value !== "") {
                setConfirmMatches(true)
                return "valid"
              }
              setConfirmMatches(false)
              if (value === "") {
                return "unknown"
              }
              return "invalid"
            },
          ]}
          tooltips={{
            invalid: {
              content: (
                <div>Your password and confirmed password don't match!</div>
              ),
              visibility: { type: "hover", delay: 0 },
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
          tooltip={{
            visibility: { type: "hover" },
            text: "One or more fields don't meet the requirements. Please fix them and try again.",
          }}
        />
      </div>
    </div>
  )
}

export default AuthorizationPage

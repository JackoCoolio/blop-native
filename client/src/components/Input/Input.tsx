import "./input.scss"

import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  Setter,
  Show,
} from "solid-js"
import { BlopColor, colorToClass } from "../../lib/themes"

import CheckIcon from "../../assets/check.svg"
import XIcon from "../../assets/x-thin.svg"
import DotsIcon from "../../assets/dots.svg"
import Tooltip, { TooltipVisibility } from "../Tooltip"

export type ValidationState = "valid" | "invalid" | "unknown"
type Validator = (value: string) => Promise<ValidationState>

type Tooltips = {
  [state in ValidationState]?: {
    content: JSX.Element
    visibility: TooltipVisibility
  }
}

interface InputProps {
  label?: string
  color: BlopColor
  password?: boolean
  placeholder?: string
  maxLength?: number
  spellcheck?: boolean
  validateDelay?: number
  validate?: Validator
  class?: string
  style?: JSX.CSSProperties
  tooltips?: Tooltips
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
  onEnter?: (value: string) => void
}

async function updateValidation(
  value: string,
  validator: Validator | undefined,
  setValidation: Setter<ValidationState>,
) {
  const valid = validator && (await validator(value))
  setValidation(valid ?? "unknown")
}

export const Input: Component<InputProps> = (props) => {
  const colorClass = colorToClass(props.color)

  const [focused, setFocused] = createSignal(false)
  const [validation, setValidation] = createSignal<ValidationState>("unknown", {
    equals: false,
  })

  createEffect(
    async () => await updateValidation("", props.validate, setValidation),
  )

  let typingTimer: number | undefined

  onCleanup(() => clearTimeout(typingTimer))

  return (
    <div
      class={`${colorClass} input-container input-container-shadow ${props.class}`}
      style={props.style}
    >
      <div
        class={`${colorClass} input-container ${
          focused() ? "input-container-focused" : ""
        }`}
      >
        {props.label && (
          <div class="input-label">
            <span>{props.label.toLocaleUpperCase()}</span>
          </div>
        )}
        <div class="input-field-container">
          <input
            class={`input-field ${
              props.password ? "input-field-password" : ""
            }`}
            type={props.password ? "password" : "text"}
            spellcheck={props.spellcheck}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                props.onEnter && props.onEnter(e.currentTarget.value)
              }
            }}
            onInput={async (e) => {
              // call onInput
              typeof props.onInput === "function" && props.onInput(e)

              const value = e.currentTarget.value
              if (props.validateDelay !== 0) {
                setValidation("unknown")
              }

              // clear timer if it's currently running
              if (typingTimer !== undefined) {
                clearTimeout(typingTimer)
              }

              // set the timer
              typingTimer = setTimeout(async () => {
                typingTimer = undefined
                updateValidation(value, props.validate, setValidation)
              }, props.validateDelay ?? 0)
            }}
            onFocusIn={() => setFocused(true)}
            onFocusOut={() => setFocused(false)}
          />
          <Show when={props.validate}>
            <InputValidationIcon
              state={validation()}
              color={props.color}
              tooltips={props.tooltips}
              inputActive={focused()}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

interface InputValidationIconProps {
  color: BlopColor
  state: ValidationState
  inputActive: boolean
  tooltips?: Tooltips
}

const ICON_MARGIN = 3
function getOffsetFromValidationState(state: ValidationState): number {
  switch (state) {
    case "valid":
      return 0
    case "invalid":
      return (24 + ICON_MARGIN) * 2
    case "unknown":
    default:
      return 24 + ICON_MARGIN
  }
}

export const InputValidationIcon: Component<InputValidationIconProps> = (
  props,
) => {
  const colorClass = colorToClass(props.color)

  return (
    <>
      <div class="input-valid-container-window">
        <div
          class={`${colorClass} input-valid-container`}
          style={{ top: `${-getOffsetFromValidationState(props.state)}px` }}
        >
          <Tooltip
            visibility={props.tooltips?.valid?.visibility ?? { type: "never" }}
            color="alpha"
          >
            {props.tooltips?.valid?.content}
            <CheckIcon class="input-valid-icon" />
          </Tooltip>
          <Tooltip
            visibility={props.tooltips?.valid?.visibility ?? { type: "never" }}
            color="epsilon"
          >
            {props.tooltips?.unknown?.content}
            <DotsIcon class="input-valid-icon" />
          </Tooltip>
          <Tooltip
            visibility={props.tooltips?.valid?.visibility ?? { type: "never" }}
            color="beta"
          >
            {props.tooltips?.invalid?.content}
            <XIcon class="input-valid-icon" />
          </Tooltip>
        </div>
      </div>
    </>
  )
}

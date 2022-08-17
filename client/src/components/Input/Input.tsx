import "./input.scss"

import {
  Component,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  Show,
} from "solid-js"
import { BlopColor, colorToClass } from "../../lib/themes"

import CheckIcon from "../../assets/check.svg"
import XIcon from "../../assets/x-thin.svg"
import DotsIcon from "../../assets/dots.svg"
import Tooltip, { TooltipVisibility } from "../Tooltip"
import {
  calculateValidation,
  ValidationState,
  MaybeCallbackValidator,
} from "./validator"

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
  validators?: MaybeCallbackValidator[]
  hideValidation?: boolean
  class?: string
  style?: JSX.CSSProperties
  tooltips?: Tooltips
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
  onAfterValidate?: (valid: ValidationState, value: string) => unknown
  onEnter?: (value: string) => unknown
  ref?: Ref<HTMLInputElement>
}

export const Input: Component<InputProps> = (props) => {
  const colorClass = colorToClass(props.color)

  const [focused, setFocused] = createSignal(false)
  const [validation, setValidation] = createSignal<ValidationState>("unknown", {
    equals: false,
  })

  // whether we have at least one validator
  const hasValidator = () => !!props.validators && props.validators.length > 0

  createEffect(async () =>
    setValidation(await calculateValidation("", props.validators)),
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

              // check if we should validate
              if (!hasValidator()) {
                return
              }

              // show pending icon while we calculate validity
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
                const state = await calculateValidation(value, props.validators)
                props.onAfterValidate?.(state, value)
                setValidation(state)
              }, props.validateDelay ?? 0)
            }}
            onFocusIn={() => setFocused(true)}
            onFocusOut={() => setFocused(false)}
            ref={props.ref}
          />
          <Show when={!props.hideValidation && hasValidator()}>
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
    <div class="input-valid-container-window">
      <div
        class={`${colorClass} input-valid-container`}
        style={{ top: `${-getOffsetFromValidationState(props.state)}px` }}
      >
        <Tooltip
          visibility={props.tooltips?.valid?.visibility ?? { type: "never" }}
          color="alpha"
          content={props.tooltips?.valid?.content}
        >
          <CheckIcon class="input-valid-icon" />
        </Tooltip>
        <Tooltip
          visibility={props.tooltips?.unknown?.visibility ?? { type: "never" }}
          color="epsilon"
          content={props.tooltips?.unknown?.content}
        >
          <DotsIcon class="input-valid-icon" />
        </Tooltip>
        <Tooltip
          visibility={props.tooltips?.invalid?.visibility ?? { type: "never" }}
          color="beta"
          content={props.tooltips?.invalid?.content}
        >
          <XIcon class="input-valid-icon" />
        </Tooltip>
      </div>
    </div>
  )
}

import "./checkbox.scss"

import { Component, createMemo, createSignal } from "solid-js"
import { BlopColor, colorToClass } from "../../lib/themes"

import CheckIcon from "../../assets/check.svg"

type CheckboxState = "checked" | "unchecked" | "disabled"

interface Props {
  color: BlopColor
  state?: CheckboxState
}

const Checkbox: Component<Props> = (props) => {
  const colorClass = colorToClass(props.color)

  const initialState = createMemo(() => props.state ?? "unchecked")

  const [state, setState] = createSignal(initialState())

  return (
    <div
      classList={{
        [colorClass]: true,
        checkbox: true,
        "checkbox-shadow": true,
      }}
    >
      <div
        classList={{
          "checkbox-face": true,
          checkbox: true,
          "checkbox-hover": state() === "unchecked",
          "checkbox-checked": state() === "checked",
        }}
        onClick={() => {
          const _state = state()
          if (_state === "checked") {
            setState("unchecked")
          } else if (_state === "unchecked") {
            setState("checked")
          }
        }}
      >
        <CheckIcon
          classList={{
            "checkbox-icon": true,
            "checkbox-checked": state() === "checked",
          }}
        />
      </div>
    </div>
  )
}

export default Checkbox

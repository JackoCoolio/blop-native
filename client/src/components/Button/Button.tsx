import "./button.scss"

import { Component, createMemo, createSignal, JSX } from "solid-js"
import { ExtendedBlopColor, colorToClass, BlopColor } from "../../lib/themes"

interface IconOptions {
  /**
   * The icon element
   */
  elt: (props: any) => SVGElement
  /**
   * The icon's X offset
   */
  x?: string
  /**
   * The icon's y offset
   */
  y?: string
}

interface Props {
  tooltip?: string
  text?: string
  color?: BlopColor
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  icon?: IconOptions
  class?: string
  /**
   * Whether or not the button is enabled. Default: `true`
   */
  enabled?: boolean
}

/**
 * A blop-styled button.
 */
export const Button: Component<Props> = (props) => {
  const Icon = props.icon?.elt
  const { x = "0", y = "0" } = props.icon ?? {}

  const enabled = createMemo(() => props.enabled ?? true)

  return (
    <button
      class={`${
        enabled() ? colorToClass(props.color) : "button-disabled"
      } button button-shadow`}
    >
      <div
        class={`${props.class ?? ""} ${
          enabled() ? colorToClass(props.color) : "button-disabled"
        } button button-face`}
        onClick={props.onClick}
        title={props.tooltip}
      >
        {Icon && (
          <Icon
            class="button-icon"
            style={{
              position: "relative",
              top: y,
              left: x,
            }}
          />
        )}
        {props.text && <span class="button-text">{props.text}</span>}
      </div>
    </button>
  )
}

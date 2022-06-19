import "./button.scss"

import { Component, createMemo, JSX } from "solid-js"
import { colorToClass, BlopColor } from "../../lib/themes"

interface IconOptions {
  /**
   * The icon element
   */
  elt: (props: { [attr: string]: unknown }) => SVGElement
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
  const enabled = createMemo(() => props.enabled ?? true)

  const onClick = (e) => props.onClick && props.onClick(e)

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
        onClick={onClick}
        title={props.tooltip}
      >
        {Icon && (
          <Icon
            class="button-icon"
            style={{
              position: "relative",
              top: props.icon?.x,
              left: props.icon?.y,
            }}
          />
        )}
        {props.text && <span class="button-text">{props.text}</span>}
      </div>
    </button>
  )
}

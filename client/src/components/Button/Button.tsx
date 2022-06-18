import "./button.scss"

import { Component, createSignal, JSX } from "solid-js"
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
}

/**
 * A blop-styled button.
 */
export const Button: Component<Props> = (props) => {
  const Icon = props.icon?.elt
  const { x = "0", y = "0" } = props.icon ?? {}

  return (
    <div class={`${colorToClass(props.color)} button button-shadow`}>
      <div
        class={`${props.class ?? ""} ${colorToClass(
          props.color,
        )} button button-face`}
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
    </div>
  )
}

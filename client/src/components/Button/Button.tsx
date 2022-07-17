import "./button.scss"

import { Component, createMemo, JSX } from "solid-js"
import { colorToClass, BlopColor } from "../../lib/themes"
import Tooltip, { TooltipVisibility } from "../Tooltip"
import Header from "../Header"

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
  /**
   * The tooltip that shows when the button is disabled.
   */
  tooltip?: {
    visibility: TooltipVisibility
    text: string // this could also be a JSX.Element
  }
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

  const onClick: NonNullable<typeof props.onClick> = (e) =>
    props.onClick && props.onClick(e)

  // createMemo is needed here
  const tooltipConfig = createMemo(() =>
    enabled() ? undefined : props.tooltip,
  )

  return (
    <Tooltip
      visibility={tooltipConfig()?.visibility ?? { type: "never" }}
      color="alpha"
    >
      {tooltipConfig()?.text && <p>{tooltipConfig()?.text}</p>}
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
          {/* {props.text && <span class="button-text">{props.text}</span>} */}
          {props.text && (
            <Header class="button-text" color={props.color}>
              {props.text}
            </Header>
          )}
        </div>
      </button>
    </Tooltip>
  )
}

export type { Props as ButtonProps }

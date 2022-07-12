import "./tooltip.scss"

import {
  children,
  createSignal,
  JSX,
  onCleanup,
  ParentComponent,
  ParentProps,
} from "solid-js"
import { BlopColor, colorToClass } from "../../lib/themes"

export type TooltipVisibility =
  | {
      type: "always"
    }
  | {
      type: "hover"
      delay?: number
    }
  | {
      type: "never"
    }

interface Props {
  visibility: TooltipVisibility
  color: BlopColor
  children: JSX.Element[]
}

export const Tooltip: ParentComponent<Props> = (props: ParentProps<Props>) => {
  const tooltipContent = children(() => props.children[0])
  const tooltipHolder = children(() => props.children[1])

  const [hovering, setHovering] = createSignal(false)
  let hoverTimer: number | undefined
  onCleanup(() => clearTimeout(hoverTimer))

  const setTimer = (delay: number) => {
    hoverTimer = setTimeout(() => {
      setHovering(true)
    }, delay ?? 0)
  }

  const colorClass = colorToClass(props.color)

  // we can't use <Show> here because it causes an error with replaceChild()
  if (props.visibility.type !== "never") {
    return (
      <div class="tooltip">
        {tooltipHolder}
        <div
          class="tooltip-activator"
          onMouseEnter={() => {
            props.visibility.type === "hover" &&
              setTimer(props.visibility.delay ?? 0)
          }}
          onMouseLeave={() => {
            setHovering(false)
            clearTimeout(hoverTimer)
          }}
        />
        <div class="tooltip-anchor">
          <div
            class={`${colorClass} tooltip-content ${
              hovering() || props.visibility.type === "always"
                ? "tooltip-content-visible"
                : ""
            }`}
          >
            <div class="tooltip-point" />
            {tooltipContent}
          </div>
        </div>
      </div>
    )
  } else {
    return tooltipHolder
  }
}

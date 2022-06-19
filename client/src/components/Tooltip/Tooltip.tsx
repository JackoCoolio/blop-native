import "./tooltip.scss"

import {
  children,
  createSignal,
  JSX,
  ParentComponent,
  ParentProps,
  Show,
} from "solid-js"
import { BlopColor, colorToClass } from "../../lib/themes"

export type TooltipVisibility = "always" | "hover" | "never"

interface Props {
  visibility: TooltipVisibility
  color: BlopColor
  children: JSX.Element[]
}

export const Tooltip: ParentComponent<Props> = (props: ParentProps<Props>) => {
  const tooltipContent = children(() => props.children[0])
  const tooltipHolder = children(() => props.children[1])

  const [hovering, setHovering] = createSignal(props.visibility === "always")

  const colorClass = colorToClass(props.color)

  return (
    <Show when={props.visibility !== "never"} fallback={<>{tooltipHolder}</>}>
      <div class="tooltip">
        {tooltipHolder}
        <div
          class="tooltip-activator"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        />
        <div class="tooltip-anchor">
          <div
            class={`${colorClass} tooltip-content ${
              hovering() || props.visibility === "always"
                ? "tooltip-content-visible"
                : ""
            }`}
          >
            <div class="tooltip-point" />
            {tooltipContent}
          </div>
        </div>
      </div>
    </Show>
  )
}

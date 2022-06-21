import "./header.scss"

import { children, ParentComponent } from "solid-js"
import { BlopColor } from "../../lib/themes"

type Props = {
  color?: BlopColor
  class?: string
  noSelect?: boolean
}

export const Header: ParentComponent<Props> = (props) => {
  const c = children(() => props.children)

  return (
    <span
      class={`header ${props.color ?? ""} ${props.class ?? ""} ${
        props.noSelect && "select-none"
      }`}
    >
      {c()}
    </span>
  )
}

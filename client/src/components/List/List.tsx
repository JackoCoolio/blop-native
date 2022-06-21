import "./list.scss"

import { children, createMemo, For, ParentComponent, Show } from "solid-js"
import { BlopColor } from "../../lib/themes"
import Header from "../Header"

type ListProps = {
  title?: string
  emptyText?: string
  color: BlopColor
  itemColor?: ((index: number) => BlopColor) | BlopColor
  grow?: boolean
}

export const List: ParentComponent<ListProps> = (props) => {
  // convert children to array if they aren't already
  const c = createMemo(() => {
    const _c = children(() => props.children)()
    if (Array.isArray(_c)) {
      return _c
    } else {
      return _c ? [_c] : []
      // return [_c]
    }
  })

  return (
    <div class={`list list-shadow ${props.color}`}>
      <div class="list list-face">
        {props.title && <Header class="list-title">{props.title}</Header>}
        <ul class="list-content">
          <Show
            when={c().length > 0}
            fallback={
              props.emptyText && (
                <span class="list-empty-text">{props.emptyText}</span>
              )
            }
          >
            <div class="list-scroll">
              <For each={c()}>
                {(item, index) => {
                  let color: BlopColor | undefined
                  if (typeof props.itemColor === "function") {
                    color = props.itemColor(index())
                  } else if (typeof props.itemColor === "string") {
                    color = props.itemColor
                  }

                  return <ListItem color={color}>{item}</ListItem>
                }}
              </For>
            </div>
          </Show>
        </ul>
      </div>
    </div>
  )
}

type ListItemProps = {
  color?: BlopColor
}

const ListItem: ParentComponent<ListItemProps> = (props) => {
  const c = children(() => props.children)

  return (
    <li class={`list-item list-item-shadow ${props.color}`}>
      <div class="list-item list-item-face">{c()}</div>
    </li>
  )
}

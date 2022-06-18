import { Component } from "solid-js"

export type LazyComponent<P = {}> = Component<P> & {
  preload: () => Promise<{
    default: Component<P>
  }>
}

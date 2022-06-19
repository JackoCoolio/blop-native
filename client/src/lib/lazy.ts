import { Component } from "solid-js"

export type LazyComponent<P = unknown> = Component<P> & {
  preload: () => Promise<{
    default: Component<P>
  }>
}

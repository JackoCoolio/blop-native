declare type Ref<T> = T | undefined

declare module "*.svg" {
  export default function (props: unknown): SVGElement
}

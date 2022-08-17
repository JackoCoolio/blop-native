declare type Ref<T> = T | ((el: T) => void)
declare type Nullish = null | undefined
declare type MaybeNullish<T> = T | Nullish

declare module "*.svg" {
  export default function (props: unknown): SVGElement
}

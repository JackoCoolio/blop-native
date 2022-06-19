import newTheme from "./new"
import classicTheme from "./classic"
import { MaybeNullish } from "../util"

const BLOP_COLORS = ["alpha", "beta", "gamma", "delta", "epsilon"] as const
export type BlopColor = typeof BLOP_COLORS[number]
export type ExtendedBlopColor = BlopColor | `${BlopColor}Dark`

type BlopVariableMap = {
  [key in ExtendedBlopColor]: string
} & {
  /**
   * The color used for text
   */
  text: string
  /**
   * The color used in the background
   */
  background: string
  /**
   * The background color, but lighter
   */
  lightBackground: string
}

/**
 * Converts a blop color to the corresponding class, and returns "" if the color is invalid.
 * @param color the blop color
 * @returns a CSS class
 */
export function colorToClass(color: MaybeNullish<BlopColor>): string {
  if (!color) return ""
  return BLOP_COLORS.includes(color) ? color : ""
}

export interface Theme {
  variables?: BlopVariableMap
}

export type BlopTheme = Theme

/**
 * A list of themes that are available to the application.
 */
export interface ThemeList {
  [theme: string]: Theme
}

/**
 * Themes used by the blop native client.
 */
const blopThemes: ThemeList = {
  new: newTheme,
  classic: classicTheme,
}

export default blopThemes

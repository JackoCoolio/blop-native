import newTheme from "./new"
import classicTheme from "./classic"
import { MaybeNullish } from "../util"

interface BlopVariableMap {
  /**
   * The color used for text
   */
  text: string
  /**
   * The color used in the background
   */
  background: string
  /**
   * The first of four blop colors
   */
  alpha: string
  /**
   * The second of four blop colors
   */
  beta: string
  /**
   * The third of four blop colors
   */
  gamma: string
  /**
   * The fourth of four blop colors
   */
  delta: string
  alphaDark: string
  betaDark: string
  gammaDark: string
  deltaDark: string
}

/**
 * Preset colors available to blop components.
 */
export type BlopColor = keyof BlopVariableMap

/**
 * Converts a blop color to the corresponding class, and returns "" if the color is invalid.
 * @param color the blop color
 * @returns a CSS class
 */
export function colorToClass(color: MaybeNullish<BlopColor>): string {
  if (!color) return ""
  return ["alpha", "beta", "gamma", "delta"].includes(color) ? color : ""
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

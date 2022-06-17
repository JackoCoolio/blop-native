import darkTheme from "./dark"
import lightTheme from "./light"

interface VariableMap {
  [variable: string]: string
}

interface BlopVariableMap extends VariableMap {
  /**
   * The primary color
   * - text
   */
  primary: string
  /**
   * The secondary color
   * - background
   */
  secondary: string
}

export interface Theme<VM extends VariableMap = VariableMap> {
  variables?: VM
}

export type BlopTheme = Theme<BlopVariableMap>

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
  light: lightTheme,
  dark: darkTheme,
}

export default blopThemes

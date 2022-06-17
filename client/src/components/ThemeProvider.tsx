import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  ParentProps,
  useContext,
} from "solid-js"
import { Theme, ThemeList } from "../lib/themes"
import { maybeObjectAccess } from "../lib/util"

/**
 * Converts a theme to valid CSS styles.
 * @param theme the theme to convert
 * @param prefix the string to prefix variables with
 * @returns CSS properties
 */
function convertThemeToStyle(
  theme: Theme | undefined,
  prefix?: string,
): JSX.CSSProperties {
  return {
    ...Object.fromEntries(
      Object.entries(theme?.variables ?? {}).map(([key, value]) => [
        `--${prefix ?? ""}${key}`,
        value,
      ]),
    ),
  }
}

/**
 * Converts the given CSS properties object into a CSS string.
 * @param style the style object
 * @returns a CSS formatted string
 */
function convertStyleToCSSString(style: JSX.CSSProperties): string {
  return Object.keys(style).reduce(
    (acc, selector) =>
      acc +
      selector
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      style[selector] +
      ";",
    "",
  )
}

function logThemeNotInitializedError(): void {
  console.error("not served by this provider")
}

const ThemeContext = createContext<ThemeStore>([
  () => {
    logThemeNotInitializedError()
    return { name: undefined, theme: {}, themeString: "" }
  },
  {
    chooseTheme: (_: string) => logThemeNotInitializedError(),
    clearTheme: () => logThemeNotInitializedError(),
  },
])

interface ThemeProviderProps {
  /**
   * Available themes
   */
  themes?: ThemeList
  /**
   * The theme to use
   */
  current?: string
  /**
   * The string to prefix CSS variables with
   */
  prefix?: string
}

const ThemeProvider = (props: ParentProps<ThemeProviderProps>): JSX.Element => {
  const styles = Object.fromEntries(
    Object.entries(props.themes ?? {}).map(([name, theme]) => [
      name,
      `:root {${convertStyleToCSSString(convertThemeToStyle(theme))}}`,
    ]),
  )

  const [getTheme, setTheme] = createSignal<ThemeChoice>({
    name: props.current,
    theme: maybeObjectAccess(props.themes, props.current, {}),
    themeString: props.current ? styles[props.current] : "",
  })

  const store: ThemeStore = [
    getTheme,
    {
      chooseTheme(name: string) {
        console.log(`chooseTheme(${name})`)
        setTheme({
          name,
          theme: maybeObjectAccess(props.themes, name, {}),
          themeString: styles[name],
        })

        document.getElementById("theme")!.innerHTML = styles[name]
      },
      clearTheme: () =>
        setTheme({ name: undefined, theme: {}, themeString: "" }),
    },
  ]

  return (
    <ThemeContext.Provider value={store}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

export interface ThemeChoice {
  name: string | undefined
  theme: Theme
  themeString: string | ""
}

export type ThemeStore = [
  Accessor<ThemeChoice>,
  {
    chooseTheme: (theme: string) => void
    clearTheme: () => void
  },
]

/**
 * Returns the theme store.
 */
export function useTheme(): ThemeStore {
  return useContext(ThemeContext)
}

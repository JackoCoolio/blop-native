/* @refresh reload */
import "windi.css"
import "./styles/app.scss"
import { render } from "solid-js/web"
import { Router } from "solid-app-router"

import App from "./App"
import ThemeProvider from "./components/ThemeProvider"
import blopThemes from "./lib/themes"

render(
  () => (
    <Router>
      <ThemeProvider themes={blopThemes} current="light" prefix="blop-">
        <App />
      </ThemeProvider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
)

/* @refresh reload */
import "windi.css"
import "./styles/app.scss"
import { render } from "solid-js/web"
import { Router } from "solid-app-router"

import App from "./App"
import ThemeProvider from "./components/ThemeProvider"
import blopThemes from "./lib/themes"
import AppContainer from "./components/AppContainer"

render(
  () => (
    <Router>
      <ThemeProvider themes={blopThemes} current="new" prefix="blop-">
        <AppContainer>
          <App />
        </AppContainer>
      </ThemeProvider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
)

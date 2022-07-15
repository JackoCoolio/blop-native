import { Component, lazy } from "solid-js"
import { Route, Routes } from "solid-app-router"
import { listen } from "@tauri-apps/api/event"
import { AuthenticationEnforcer } from "./lib/auth"

// lazy loading pages
const GamePage = lazy(() => import("./pages/Game"))
const HomePage = lazy(() => import("./pages/Home"))
const AuthorizationPage = lazy(() => import("./pages/Authorization"))

const App: Component = () => {
  // disable context menu (right click)
  document.addEventListener("contextmenu", (e) => e.preventDefault())

  listen("notification", (e) => {
    const type = e.payload.type
    if (type == "lostConnection") {
      console.log("lost connection!", Math.random())
    } else if (type == "connected") {
      console.log("connected! first connection:", e.payload.firstConnection)
    }
  })

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthorizationPage />} />
      <Route
        path="/game/:id"
        element={
          <AuthenticationEnforcer
            page={GamePage}
            props={{ id: "foo" }}
            fallback={<div>loading</div>}
          />
        }
      />
    </Routes>
  )
}

export default App

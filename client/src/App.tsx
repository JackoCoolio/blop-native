import { Component, lazy } from "solid-js"
import { Route, Routes } from "solid-app-router"
import { listen } from "@tauri-apps/api/event"

// lazy loading pages
const Game = lazy(() => import("./pages/Game"))
const Home = lazy(() => import("./pages/Home"))
const Authorization = lazy(() => import("./pages/Authorization"))

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
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Authorization />} />
      <Route path="/game/:id" element={<Game id="foo" />} />
    </Routes>
  )
}

export default App

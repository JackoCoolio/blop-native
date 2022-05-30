import { Component, lazy } from "solid-js"
import { Route, Routes } from "solid-app-router"

// lazy loading pages
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))

const App: Component = () => {
  // disable context menu (right click)
  document.addEventListener("contextmenu", (e) => e.preventDefault())

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App

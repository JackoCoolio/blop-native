import { Link } from "solid-app-router"
import { Component } from "solid-js"

const HomePage: Component = () => {
  return (
    <div>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </div>
  )
}

export default HomePage

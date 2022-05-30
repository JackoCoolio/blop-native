import { Link } from "solid-app-router"
import { Component } from "solid-js"

const Home: Component = () => {
  return (
    <div>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default Home

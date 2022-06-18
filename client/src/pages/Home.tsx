import { Link, useNavigate } from "solid-app-router"
import { Component } from "solid-js"

const Home: Component = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </div>
  )
}

export default Home

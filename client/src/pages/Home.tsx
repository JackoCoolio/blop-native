import { Link, useNavigate } from "solid-app-router"
import { Component, createComponent, onMount } from "solid-js"

const Home: Component = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default Home

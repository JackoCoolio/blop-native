import { Link } from "solid-app-router"
import { Component } from "solid-js"

const Login: Component = () => {
  return (
    <div>
      <Link href="/">Go home</Link>
      <p>Log in</p>
      <p>Username</p>
      <input type="text"></input>
      <p>Password</p>
      <input type="text"></input>
      <button
        onClick={() => {
          console.log("click")
        }}
      >
        Submit
      </button>
    </div>
  )
}

export default Login

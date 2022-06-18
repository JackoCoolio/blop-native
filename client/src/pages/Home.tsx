import { Link, useNavigate } from "solid-app-router"
import { Component } from "solid-js"
import { InputContainer } from "../components/InputContainer/InputContainer"

const Home: Component = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <InputContainer highlightMode="never">
        <input />
      </InputContainer>
    </div>
  )
}

export default Home

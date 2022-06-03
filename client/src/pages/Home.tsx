import { Link, useNavigate } from "solid-app-router"
import { Component, createComponent, onMount } from "solid-js"

const Home: Component = () => {
  const navigate = useNavigate()

  let idInput: HTMLInputElement
  return (
    <div>
      <input ref={idInput} type="text" />
      <button
        onClick={() => {
          // go to game with given ID
          navigate(`/game/${idInput.value}`, { replace: true })
        }}
      >
        Go
      </button>
    </div>
  )
}

export default Home

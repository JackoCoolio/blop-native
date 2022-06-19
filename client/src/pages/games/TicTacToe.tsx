import { Component } from "solid-js"
import { GameProps } from "../Game"

const TicTacToePage: Component<GameProps> = (props: GameProps) => {
  return <div>TicTacToe {props.id}</div>
}

export default TicTacToePage

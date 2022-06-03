import { Component } from "solid-js"
import { GameProps } from "../Game"

interface TicTacToeProps extends GameProps {}

const TicTacToe: Component<TicTacToeProps> = (props: TicTacToeProps) => {
  return <div>TicTacToe {props.id}</div>
}

export default TicTacToe

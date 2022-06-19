import { Component } from "solid-js"
import { GameProps } from "../Game"

const RockPaperScissorsPage: Component<GameProps> = (props: GameProps) => {
  return <div>RockPaperScissors {props.id}</div>
}

export default RockPaperScissorsPage

import { Component } from "solid-js"
import { GameProps } from "../Game"

interface RockPaperScissorsProps extends GameProps {}

const RockPaperScissors: Component<RockPaperScissorsProps> = (
  props: RockPaperScissorsProps,
) => {
  return <div>RockPaperScissors {props.id}</div>
}

export default RockPaperScissors

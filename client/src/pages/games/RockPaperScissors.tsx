import { Component } from "solid-js"
import { GameProps } from "../Game"

interface RockPaperScissorsProps extends GameProps {}

const RockPaperScissorsPage: Component<RockPaperScissorsProps> = (
  props: RockPaperScissorsProps,
) => {
  return <div>RockPaperScissors {props.id}</div>
}

export default RockPaperScissorsPage

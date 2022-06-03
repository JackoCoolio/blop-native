import { Component, JSX, lazy, Suspense } from "solid-js"

const TicTacToe = lazy(() => import("./games/TicTacToe"))
const RockPaperScissors = lazy(() => import("./games/RockPaperScissors"))

enum GameType {
  TicTacToe,
  RockPaperScissors,
}

/**
 * Fetches the type of the game from the database.
 * @param id the game ID
 * @returns the game type
 */
function fetchGameType(id: string): Promise<GameType> {
  return new Promise((resolve) => {
    // fake fetch operation
    setTimeout(() => {
      resolve(GameType.TicTacToe)
    }, 2000)
  })
}

type LazyComponent<P = {}> = Component<P> & {
  preload: () => Promise<{
    default: Component<P>
  }>
}

/**
 * Lazily loads a game component.
 * @param id the game ID
 * @returns a lazy-loaded component
 */
function getGameComponent(id: string): LazyComponent<GameProps> {
  return lazy(async () => {
    const gameType = await fetchGameType(id)
    if (gameType === GameType.TicTacToe) {
      return import("./games/TicTacToe")
    } else if (gameType === GameType.RockPaperScissors) {
      return import("./games/RockPaperScissors")
    }
  })
}

export interface GameProps {
  id: string
}

const Game: Component<GameProps> = (props: GameProps) => {
  const GameComponent = getGameComponent(props.id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameComponent id={props.id} />
    </Suspense>
  )
}

export default Game

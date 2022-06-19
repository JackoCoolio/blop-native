import { Component, lazy, Suspense } from "solid-js"
import { LazyComponent } from "../lib/lazy"

enum GameType {
  TicTacToe,
  RockPaperScissors,
}

/**
 * Fetches the type of the game from the database.
 * @param id the game ID
 * @returns the game type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fetchGameType(id: string): Promise<GameType> {
  return new Promise((resolve) => {
    // fake fetch operation
    setTimeout(() => {
      resolve(GameType.TicTacToe)
    }, 2000)
  })
}

/**
 * Lazily loads a game component.
 * @param id the game ID
 * @returns a lazy-loaded component
 */
function getGameComponent(id: string): LazyComponent<GameProps> {
  return lazy(async (): Promise<{ default: Component }> => {
    const gameType = await fetchGameType(id)
    if (gameType === GameType.TicTacToe) {
      return import("./games/TicTacToe")
    } else if (gameType === GameType.RockPaperScissors) {
      return import("./games/RockPaperScissors")
    }

    return {
      default: () => {
        return (
          <div>
            <h1>Error: Invalid game type!</h1>
          </div>
        )
      },
    }
  })
}

export interface GameProps {
  id: string
}

const GamePage: Component<GameProps> = (props: GameProps) => {
  const GameComponent = getGameComponent(props.id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameComponent id={props.id} />
    </Suspense>
  )
}

export default GamePage

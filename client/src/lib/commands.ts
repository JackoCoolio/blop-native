import { invoke } from "@tauri-apps/api"
import { GameState } from "../types/game/state"
import { GameType } from "../types/game/type"

/**
 * Sends a message to the WebSocket server.
 * @param message the message to send
 * @returns an error if the websocket server isn't connected
 */
export async function sendMessage(message: string): Promise<void> {
  return await invoke("send_message", { message })
}

/**
 * Gets the state of the active game.
 * @returns a game state
 */
export async function getGameState(): Promise<GameState> {
  return await invoke("get_game_state")
}

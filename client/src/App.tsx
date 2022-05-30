import { Component, For } from "solid-js"
import { createSignal } from "solid-js"
import { invoke } from "@tauri-apps/api"
import { Event, listen } from "@tauri-apps/api/event"
import { LatencyEventPayload, MessageEventPayload } from "./events"

const App: Component = () => {
  // disable context menu (right click)
  document.addEventListener("contextmenu", (e) => e.preventDefault())

  let input: HTMLInputElement

  const [messages, setMessages] = createSignal<string[]>([])
  const [latency, setLatency] = createSignal<number>(0)

  listen("message", (e: Event<MessageEventPayload>) => {
    // verify that payload is string
    console.log(`event from backend:`, e.payload)

    setMessages([...messages(), e.payload.message])
  })

  listen("latency", (e: Event<LatencyEventPayload>) => {
    setLatency(e.payload.latency)
  })

  async function sendMessage(): Promise<void> {
    const value = input.value
    console.log(`sending message '${value}'`)
    input.value = ""
    await invoke("send_message", { message: value })
  }

  return (
    <div class="flex flex-col">
      <div class="flex flex-row justify-evenly bg-dark-700">
        <input
          ref={input}
          type="text"
          class="border-2  border-gray-700 focus:outline-none rounded-md mx-12 bg-dark-50"
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              sendMessage()
            }
          }}
        ></input>
        <button
          class="border-2 border-gray-700 rounded-md mx-12"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
      <div>
        <For each={messages()}>{(message, i) => <p>{message}</p>}</For>
      </div>
      <span>{latency()}ms</span>
    </div>
  )
}

export default App

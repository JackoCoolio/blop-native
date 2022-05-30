# Blop

The native application for Blop.
As an educational exercise, I'm building this as an amalgamation of a bunch of different languages and frameworks.

Note: I'm currently only actively supporting this on Windows.

## Languages

- **Rust** for application backend
- **TypeScript** for application frontend
- **Go** for server

## Frameworks/Tools

- **[Tauri](https://github.com/tauri-apps/tauri)** for native application support
- **[Solid](https://github.com/solidjs/solid)** for the frontend web framework
- **[Tokio/Tungstenite](https://github.com/snapview/tokio-tungstenite)** for client-side WebSocket communication
- **[Tailwind](https://github.com/tailwindlabs/tailwindcss) [(Windicss)](https://github.com/windicss/windicss)** for styling
- **[Gin](https://github.com/gin-gonic/gin)** for server-side REST API
- **[Gorilla WebSocket](https://github.com/gorilla/websocket)** for server-side WebSocket API
- **[Task](https://github.com/go-task/task)** for task running

# Installation

## From Source

Make sure you have the following tools installed.

- Rust (cargo, rustc)
- Go
- Yarn
- Task

### Instructions

1. `git clone https://github.com/jackocoolio/blop-native`
2. `task bootstrap`

#### Client

3. `task client:build`
4. The compiled binary will be at `client/target/release/blop-native.exe`.
   An MSI installer can be found in `client/target/release/bundle/msi/`.

#### Server

3. `task server:build`
4. The compiled binary will be at `server/blop-backend.exe`

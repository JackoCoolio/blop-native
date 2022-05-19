# Blop

The native application for Blop.
As an educational exercise, I'm building this as an amalgamation of a bunch of different languages and frameworks.

Note: I'm currently only actively supporting this on Windows.

## Languages

- Rust
- TypeScript
- Go (server-side)

## Frameworks/Tools

- **Tauri** for native application support
- **Solid.js** for the frontend web framework
- **Tokio/Tungstenite** for client-side WebSocket communication
- **Tailwind (Windicss)** for styling
- **Gin** for server-side REST API
- **Gorilla WebSocket** for server-side WebSocket API
- **Task** for task running

# Installation

## Source

1. `git clone https://github.com/jackocoolio/blop-native`

### Client

2. `task client:build`
3. The compiled binary will be at `client/target/release/blop-native.exe`.
   An MSI installer can be found in `client/target/release/bundle/msi/`.

### Server

2. `task server:build`
3. The compiled binary will be at `server/blop-backend.exe`

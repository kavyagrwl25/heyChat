# HeyChat

HeyChat is a simple real-time chat app built with React, Vite, Material UI, Express, and Socket.IO. It lets users join a shared room with a display name, send messages instantly, and see who is currently online.

## Features

- Real-time messaging with Socket.IO
- Join flow with custom display names
- Live online user list
- System messages for join, rename, and leave events
- In-memory message history for newly connected users
- Responsive Material UI interface
- Client linting and production build support

## Tech Stack

- Frontend: React 19, Vite, Material UI
- Backend: Express 5, Socket.IO
- Tooling: ESLint, Nodemon

## Project Structure

```text
heyChat/
|-- client/
|   |-- src/
|   |-- public/
|   `-- package.json
|-- server/
|   |-- index.js
|   `-- package.json
`-- readme.md
```

## Getting Started

### 1. Install dependencies

Install dependencies in both apps:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

### 2. Start the backend

From the `server` folder:

```bash
npm run dev
```

The Socket.IO server runs on `http://localhost:4000`.

### 3. Start the frontend

From the `client` folder:

```bash
npm run dev
```

The Vite app runs on `http://localhost:5173`.

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm start
```

## How It Works

- When a user opens the app, the client connects to the Socket.IO server.
- The user joins the room by choosing a display name.
- The server tracks connected users in memory and broadcasts presence updates.
- Messages are broadcast to everyone in the shared room instantly.
- The server stores the latest messages in memory so new users can see recent chat history.

## Environment Notes

- The client connects to `http://localhost:4000` by default.
- You can override the client socket URL with `VITE_SERVER_URL`.
- The server currently uses a fixed port and fixed client origin in `server/index.js`.

## Current Limitations

- Messages and users are stored only in memory.
- Restarting the server clears chat history.
- There are no private rooms, authentication, or database persistence yet.

## Verification

The project has been checked with:

```bash
cd client && npm run lint
cd client && npm run build
cd server && node --check index.js
```

## Next Ideas

- Add persistent message storage with MongoDB or PostgreSQL
- Support multiple rooms
- Add typing indicators
- Add timestamps grouped by day
- Add authentication and user avatars

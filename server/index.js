import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"

const app = express()
const PORT = 4000
const CLIENT_ORIGIN = "http://localhost:5173"
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
})

const activeUsers = new Map()
const messages = []
const MAX_MESSAGES = 100

function buildMessage({ type = "message", author = "System", authorId = "system", text }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    author,
    authorId,
    text,
    timestamp: new Date().toISOString(),
  }
}

function getActiveUsers() {
  return Array.from(activeUsers.values())
}

function pushMessage(message) {
  messages.push(message)

  if (messages.length > MAX_MESSAGES) {
    messages.shift()
  }
}

function broadcastSystemMessage(text) {
  const systemMessage = buildMessage({ type: "system", text })
  pushMessage(systemMessage)
  io.emit("chat:message", systemMessage)
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.emit("chat:bootstrap", {
    messages,
    activeUsers: getActiveUsers(),
  })

  socket.on("chat:join", ({ name }) => {
    const trimmedName = name?.trim()

    if (!trimmedName) {
      socket.emit("chat:error", { message: "Please enter a display name before joining." })
      return
    }

    const user = {
      id: socket.id,
      name: trimmedName,
    }

    const previousName = activeUsers.get(socket.id)?.name
    activeUsers.set(socket.id, user)

    socket.emit("chat:joined", {
      user,
      activeUsers: getActiveUsers(),
    })

    io.emit("chat:presence", {
      activeUsers: getActiveUsers(),
    })

    if (!previousName) {
      broadcastSystemMessage(`${trimmedName} joined the room.`)
      return
    }

    if (previousName !== trimmedName) {
      broadcastSystemMessage(`${previousName} is now chatting as ${trimmedName}.`)
    }
  })

  socket.on("chat:message:send", ({ text }) => {
    const user = activeUsers.get(socket.id)
    const trimmedText = text?.trim()

    if (!user) {
      socket.emit("chat:error", { message: "Join the room before sending messages." })
      return
    }

    if (!trimmedText) {
      socket.emit("chat:error", { message: "Messages cannot be empty." })
      return
    }

    const nextMessage = buildMessage({
      author: user.name,
      authorId: socket.id,
      text: trimmedText,
    })

    pushMessage(nextMessage)
    io.emit("chat:message", nextMessage)
  })

  socket.on("disconnect", () => {
    const disconnectedUser = activeUsers.get(socket.id)
    activeUsers.delete(socket.id)

    io.emit("chat:presence", {
      activeUsers: getActiveUsers(),
    })

    if (disconnectedUser) {
      broadcastSystemMessage(`${disconnectedUser.name} left the room.`)
    }

    console.log(`User disconnected: ${socket.id}`)
  })
})

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)

app.get("/", (request, response) => {
  response.json({
    name: "HeyChat server",
    status: "ok",
    activeUsers: getActiveUsers().length,
    messagesStored: messages.length,
  })
})

server.listen(PORT, () => {
  console.log(`HeyChat server listening on http://localhost:${PORT}`)
})

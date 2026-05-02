import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import "./App.css"

const SOCKET_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000"

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

function App() {
  const socketRef = useRef(null)
  const joinedUserRef = useRef("")
  const [socketId, setSocketId] = useState("")
  const [joinedUser, setJoinedUser] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [messages, setMessages] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [connectionState, setConnectionState] = useState("connecting")
  const [error, setError] = useState("")
  const messageFeedRef = useRef(null)

  useEffect(() => {
    const nextSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    })

    socketRef.current = nextSocket

    nextSocket.on("connect", () => {
      setConnectionState("connected")
      setSocketId(nextSocket.id)

      if (joinedUserRef.current) {
        nextSocket.emit("chat:join", { name: joinedUserRef.current })
      }
    })

    nextSocket.on("disconnect", () => {
      setConnectionState("disconnected")
      setSocketId("")
    })

    nextSocket.on("chat:bootstrap", ({ messages: initialMessages, activeUsers: initialUsers }) => {
      setMessages(initialMessages)
      setActiveUsers(initialUsers)
    })

    nextSocket.on("chat:error", ({ message }) => {
      setError(message)
    })

    nextSocket.on("chat:joined", ({ user, activeUsers: currentUsers }) => {
      joinedUserRef.current = user.name
      setJoinedUser(user.name)
      setNameInput(user.name)
      setActiveUsers(currentUsers)
      setError("")
    })

    nextSocket.on("chat:presence", ({ activeUsers: currentUsers }) => {
      setActiveUsers(currentUsers)
    })

    nextSocket.on("chat:message", (incomingMessage) => {
      setMessages((currentMessages) => [...currentMessages, incomingMessage])
    })

    return () => {
      nextSocket.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!messageFeedRef.current) {
      return
    }

    messageFeedRef.current.scrollTop = messageFeedRef.current.scrollHeight
  }, [messages])

  const handleJoin = (event) => {
    event.preventDefault()

    const trimmedName = nameInput.trim()

    if (!trimmedName || !socketRef.current) {
      return
    }

    socketRef.current.emit("chat:join", { name: trimmedName })
  }

  const handleSendMessage = (event) => {
    event.preventDefault()

    const trimmedMessage = messageInput.trim()

    if (!trimmedMessage || !socketRef.current || !joinedUser) {
      return
    }

    socketRef.current.emit("chat:message:send", { text: trimmedMessage })
    setMessageInput("")
    setError("")
  }

  return (
    <Box className="app-shell">
      <Container maxWidth="lg" className="app-container">
        <Paper elevation={0} className="hero-panel">
          <Stack spacing={2}>
            <Chip
              label={connectionState === "connected" ? "Live now" : "Reconnecting"}
              color={connectionState === "connected" ? "success" : "warning"}
              className="status-chip"
            />
            <Typography variant="h2" className="hero-title">
              HeyChat
            </Typography>
            <Typography variant="h6" className="hero-subtitle">
              A real-time room for quick hellos, team updates, and low-friction conversations.
            </Typography>
          </Stack>
        </Paper>

        <Box className="chat-grid">
          <Paper elevation={0} className="sidebar-panel">
            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" className="panel-label">
                  Your profile
                </Typography>
                <Typography variant="h5" className="panel-title">
                  {joinedUser || "Join the room"}
                </Typography>
                <Typography variant="body2" className="panel-copy">
                  Pick a display name, hop in, and your messages will appear instantly for everyone else.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleJoin} className="join-form">
                <TextField
                  label="Display name"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  fullWidth
                  disabled={connectionState !== "connected"}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={connectionState !== "connected" || !nameInput.trim()}
                >
                  {joinedUser ? "Update name" : "Join chat"}
                </Button>
              </Box>

              <Box>
                <Typography variant="overline" className="panel-label">
                  People online
                </Typography>
                <List className="user-list">
                  {activeUsers.length === 0 ? (
                    <ListItem className="empty-state">No one is here yet.</ListItem>
                  ) : (
                    activeUsers.map((user) => (
                      <ListItem key={user.id} className="user-row">
                        <Avatar className="user-avatar">{user.name.slice(0, 1).toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="body1">{user.name}</Typography>
                          <Typography variant="caption" className="user-meta">
                            {user.id === socketId ? "You" : "Online"}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} className="chat-panel">
            <Stack spacing={2} className="chat-panel-inner">
              <Box className="chat-header">
                <Box>
                  <Typography variant="overline" className="panel-label">
                    Shared room
                  </Typography>
                  <Typography variant="h4" className="panel-title">
                    Conversation
                  </Typography>
                </Box>
                <Chip label={`${activeUsers.length} online`} variant="outlined" />
              </Box>

              {error ? <Alert severity="warning">{error}</Alert> : null}

              <Box ref={messageFeedRef} className="message-feed">
                {messages.length === 0 ? (
                  <Box className="message-empty">
                    <Typography variant="h6">No messages yet</Typography>
                    <Typography variant="body2">
                      Join the room and send the first one to get things started.
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.authorId === socketId
                    const isSystemMessage = message.type === "system"

                    return (
                      <Box
                        key={message.id}
                        className={
                          isSystemMessage
                            ? "message-card system-message"
                            : isOwnMessage
                              ? "message-card own-message"
                              : "message-card"
                        }
                      >
                        <Box className="message-meta">
                          <Typography variant="subtitle2">
                            {isSystemMessage ? "System" : message.author}
                          </Typography>
                          <Typography variant="caption">{formatTime(message.timestamp)}</Typography>
                        </Box>
                        <Typography variant="body1" className="message-text">
                          {message.text}
                        </Typography>
                      </Box>
                    )
                  })
                )}
              </Box>

              <Box component="form" onSubmit={handleSendMessage} className="composer">
                <TextField
                  label={joinedUser ? "Type a message" : "Join first to chat"}
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  fullWidth
                  disabled={!joinedUser || connectionState !== "connected"}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!joinedUser || connectionState !== "connected" || !messageInput.trim()}
                >
                  Send
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default App

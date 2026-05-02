import React, { useState, useEffect, useMemo } from "react"
import { io } from "socket.io-client"
import { Container, Typography, TextField, Button } from "@mui/material"

function App() {
  const socket = useMemo(() => io("http://localhost:4000"), [])
  const [message, setMessage] = React.useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    socket.emit("message", message)
    setMessage("")
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected with id: ${socket.id}`)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <Container maxWidth="sm">
      <Typography variant="h1" component="div" gutterBottom>
        Welcome to HeyChat!
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Type your message"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>
    </Container>
  )
}

export default App

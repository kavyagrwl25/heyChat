import React from "react"
import { io } from "socket.io-client"

function App() {
  const socket = io("http://localhost:4000")
  return (
    <div>App</div>
  )
}

export default App

import express from 'express';
import { createServer } from "http";
import { Server } from 'socket.io';
import cors from "cors";

const app = express();
const PORT = 4000;
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});          

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)
    socket.on("message", (message) => {
        console.log(`Message from ${socket.id}: ${message}`)
        socket.broadcast.emit("message", message)
    })
    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`)
    })
})

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.get("/", (req, res) => {
    res.send("Hello World")
})

server.listen(PORT, ()=> {
    console.log(`You are now connected on server at ${PORT}`)
})
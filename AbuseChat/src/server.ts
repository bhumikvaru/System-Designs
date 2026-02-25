const express = require('express');
const http = require("http")
const {Server} = require("socket.io")
import type { Socket } from "socket.io"
import { maskAbuse } from "./trie/abuseFilter"

const app = express();
const server = http.createServer(app)

interface ChatMessage {
  user: string;
  cleanMessage: string;
  time: string;
}

const io = new Server(server,{
    cors: {
        origin: "*"
    }
})

app.use(express.static("public"))

io.on("connection",(socket: Socket) =>{
    console.log("Connected", socket.id)



        socket.on("join", (username: string) => {
            socket.data.username = username;
        });
            socket.on("chat-message", (message: string) => {

            const cleanMessage = maskAbuse(message);

            io.emit("chat-message", {
                user: socket.data.username,
                message: cleanMessage,
                time: new Date().toLocaleTimeString(),
            });
            });

        socket.on("disconnect", () =>{
            console.log("Disconnected:", socket.id)
        })
    })

    server.listen(3000, () =>{
        console.log("Server running on http://localhost:3000")
    })
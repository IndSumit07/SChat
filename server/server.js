import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { ConnectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
//create express app and http server
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: "*" }
})

export const userSocketMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

    })
})

//middleware setup
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(cors());

app.use("/api/status", (req, res) => {
    res.send("Server is live!!!");
})

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to MONGODB
await ConnectDB();
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})
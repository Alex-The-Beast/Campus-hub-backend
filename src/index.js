import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config/serverConfig.js";
import connectDB from "./config/dbConfig.js";
import PYQRoutes from "./routes/PYQRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import fs from "fs";
import Chat from "./schema/chat.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://campus-hub.pages.dev", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Maximum messages to fetch
const MAX_MESSAGES = 500;

// Store all connected users
const users = new Map();

// ----- Nickname Generator (Unique) -----
const adjectives = [
  "Silent",
  "Smart",
  "Brave",
  "Quick",
  "Clever",
  "Bold",
  "Mighty",
  "Swift",
  "Happy",
  "Calm",
  "Fierce",
  "Bright",
  "Gentle",
  "Noble",
  "Wise",
  "Sharp",
  "Chill",
  "Epic",
  "Wild",
  "Stealthy",
  "Lucky",
  "Jolly",
  "Cool",
  "Sly",
  "Fearless",
];
const animals = [
  "Fox",
  "Owl",
  "Tiger",
  "Wolf",
  "Eagle",
  "Lion",
  "Bear",
  "Hawk",
  "Panther",
  "Falcon",
  "Leopard",
  "Cheetah",
  "Shark",
  "Whale",
  "Dolphin",
  "Raven",
  "Viper",
  "Cobra",
  "Stag",
  "Buffalo",
  "Horse",
  "Panda",
  "Koala",
  "Dragon",
];

function generateUniqueNickname() {
  let nickname;
  do {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    nickname = `${adj}${animal}${num}`;
  } while ([...users.values()].some((u) => u.nickname === nickname));
  return nickname;
}

// ----- Chat Moderation -----
const filter = new Filter();
const logToFile = (data) => {
  const log = `[${new Date().toISOString()}] ${data}\n`;
  fs.appendFileSync("chat.log", log);
};

// ----- Helper: Broadcast user count -----
function broadcastUserCount() {
  const count = users.size;
  let message =
    count <= 1 ? "No one else in the room" : `${count - 1} users online`;
  io.emit("updateUserCount", message);
}

// ----- WebSocket Handling -----
io.on("connection", (socket) => {
  let nickname;

  // Client may send an existing nickname
  socket.on("setNickname", (clientNickname) => {
    nickname = clientNickname;
    // users.set(socket.id, { nickname, typing: false, location: null });
    // broadcastUserCount();

    if (!users.has(socket.id)) {
      users.set(socket.id, { nickname, typing: false, location: null });
      broadcastUserCount();
    }
  });

  // If client has no nickname, generate one
  if (!nickname) {
    nickname = generateUniqueNickname();
    users.set(socket.id, { nickname, typing: false, location: null });
    socket.emit("yourInfo", { nickname });
  }

  logToFile(`User connected: ${nickname} (${socket.id})`);
  console.log(`User connected: ${nickname} (${socket.id})`);

  // Send last messages from MongoDB
  (async () => {
    try {
      const recentMessages = await Chat.find({})
        .sort({ createdAt: -1 })
        .limit(MAX_MESSAGES)
        .lean();
      socket.emit("chatHistory", recentMessages.reverse());
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  })();

  broadcastUserCount();

  // ----- Messages -----
  socket.on("sendMessage", async (msgText) => {
    if (!msgText || msgText.trim().length === 0) return;

    const cleanText = filter.clean(msgText);

    try {
      const messageDoc = new Chat({
        room: "general",
        user: nickname,
        text: cleanText,
      });
      await messageDoc.save();

      io.emit("receiveMessage", {
        id: messageDoc._id,
        user: nickname,
        text: cleanText,
        timestamp: messageDoc.createdAt,
      });

      logToFile(`${nickname}: ${cleanText}`);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Typing status
  socket.on("typing", () => {
    const user = users.get(socket.id);
    if (!user) return;
    user.typing = true;
    users.set(socket.id, user);

    io.emit(
      "userTyping",
      Array.from(users.values())
        .filter((u) => u.typing)
        .map((u) => u.nickname)
    );

    setTimeout(() => {
      user.typing = false;
      users.set(socket.id, user);
      io.emit(
        "userTyping",
        Array.from(users.values())
          .filter((u) => u.typing)
          .map((u) => u.nickname)
      );
    }, 2000);
  });

  // Location updates
  socket.on("location", (location) => {
    const user = users.get(socket.id);
    if (user) {
      user.location = location;
      users.set(socket.id, user);
      io.emit("updateUserLocations", Array.from(users.values()));
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    users.delete(socket.id);
    logToFile(`User disconnected: ${nickname} (${socket.id})`);
    console.log(`User disconnected: ${nickname} (${socket.id})`);
    broadcastUserCount();
  });
});

// Express routes
app.get("/", (req, res) => res.send("Hello, World!"));
app.use("/api/pyqs", PYQRoutes);

// Start server and connect to MongoDB
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

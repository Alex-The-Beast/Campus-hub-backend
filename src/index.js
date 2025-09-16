// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import { PORT } from "./config/serverConfig.js";
// import connectDB from "./config/dbConfig.js";
// import PYQRoutes from "./routes/PYQRoutes.js";
// import http from "http";
// import { Server } from "socket.io";
// import { Filter } from "bad-words";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";

// const app = express();
// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // message related code
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// // ----- In-memory Message Store -----
// let messages = []; // last 500 messages
// const MAX_MESSAGES = 500;
// let onlineUsers = 0;

// // ----- Nickname Generator -----
// const adjectives = ["Silent", "Smart", "Brave", "Quick", "Clever"];
// const animals = ["Fox", "Owl", "Tiger", "Wolf", "Eagle"];
// const generateNickname = () => {
//   const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
//   const animal = animals[Math.floor(Math.random() * animals.length)];
//   const num = Math.floor(Math.random() * 1000);
//   return `${adj}${animal}${num}`;
// };

// // ----- Chat Moderation -----
// const filter = new Filter();

// const logToFile = (data) => {
//   const log = `[${new Date().toISOString()}] ${data}\n`;
//   fs.appendFileSync("chat.log", log);
// };

// // ----- WebSocket Handling -----
// io.on("connection", (socket) => {
//   onlineUsers++;
//   console.log("User connected: " + socket.id);

//   // Assign random nickname
//   const nickname = generateNickname();
//   socket.data.nickname = nickname;
//   logToFile(`User connected: ${nickname} (${socket.id})`);

//   // Send last messages
//   socket.emit("chatHistory", messages);
//   io.emit("updateUserCount", onlineUsers);

//   // Listen for messages
//   socket.on("sendMessage", (msgText) => {
//     if (!msgText || msgText.trim().length === 0) return;

//     const cleanText = filter.clean(msgText);

//     const message = {
//       id: uuidv4(),
//       user: socket.data.nickname,
//       text: cleanText,
//       timestamp: new Date(),
//     };

//     messages.push(message);
//     if (messages.length > MAX_MESSAGES) messages.shift(); // keep only last N

//     // Broadcast to all
//     io.emit("receiveMessage", message);
//     logToFile(`${message.user}: ${message.text}`);
//   });

//   socket.on("typing", () => {
//     socket.broadcast.emit("userTyping");
//   });

//   socket.on("disconnect", () => {
//     onlineUsers--;
//     console.log(`User disconnected: ${nickname}`);
//     logToFile(`User disconnected: ${nickname} (${socket.id})`);
//     io.emit("updateUserCount", onlineUsers);
//   });
// });

// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });

// // Routes
// app.use("/api/pyqs", PYQRoutes);

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   connectDB();
// });

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config/serverConfig.js";
import connectDB from "./config/dbConfig.js";
import PYQRoutes from "./routes/PYQRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Optional: Gemini AI import
// import { GeminiClient } from "gemini-ai"; 
// const gemini = new GeminiClient({ apiKey: process.env.GEMINI_API_KEY });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ----- In-memory Message Store -----
let messages = []; // last 500 messages
const MAX_MESSAGES = 500;

// Store all connected users
const users = new Map();

// ----- Nickname Generator -----
const adjectives = ["Silent", "Smart", "Brave", "Quick", "Clever"];
const animals = ["Fox", "Owl", "Tiger", "Wolf", "Eagle"];
const generateNickname = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${animal}${num}`;
};

// ----- Chat Moderation -----
const filter = new Filter();
const logToFile = (data) => {
  const log = `[${new Date().toISOString()}] ${data}\n`;
  fs.appendFileSync("chat.log", log);
};

// ----- Helper: Broadcast user count -----
function broadcastUserCount() {
  const count = users.size;
  let message;
  if (count <= 1) message = "No one else in the room";
  else message = `${count} users online`;
  io.emit("updateUserCount", message);
}

// ----- WebSocket Handling -----
io.on("connection", (socket) => {
  // Assign random nickname and initial status
  const nickname = generateNickname();
  users.set(socket.id, { nickname, typing: false, location: null });

  logToFile(`User connected: ${nickname} (${socket.id})`);
  console.log(`User connected: ${nickname} (${socket.id})`);

  // Send last messages
  socket.emit("chatHistory", messages);

  // Broadcast user count
  broadcastUserCount();

  // Listen for new messages
  socket.on("sendMessage", async (msgText) => {
    if (!msgText || msgText.trim().length === 0) return;

    let cleanText = filter.clean(msgText);

    // Optional Gemini AI moderation
    // const response = await gemini.moderateText(msgText);
    // if (response.flagged) cleanText = "[Message removed due to inappropriate content]";

    const message = {
      id: uuidv4(),
      user: nickname,
      text: cleanText,
      timestamp: new Date(),
    };

    messages.push(message);
    if (messages.length > MAX_MESSAGES) messages.shift();

    io.emit("receiveMessage", message);
    logToFile(`${nickname}: ${cleanText}`);
  });

  // Typing status
  socket.on("typing", () => {
    const user = users.get(socket.id);
    if (user) {
      user.typing = true;
      users.set(socket.id, user);

      const typingUsers = Array.from(users.values())
        .filter((u) => u.typing)
        .map((u) => u.nickname);

      io.emit("userTyping", typingUsers);

      setTimeout(() => {
        user.typing = false;
        users.set(socket.id, user);

        const typingUsers = Array.from(users.values())
          .filter((u) => u.typing)
          .map((u) => u.nickname);
        io.emit("userTyping", typingUsers);
      }, 2000);
    }
  });

  // Receive location updates
  socket.on("location", (location) => {
    const user = users.get(socket.id);
    if (user) {
      user.location = location;
      users.set(socket.id, user);
      io.emit("updateUserLocations", Array.from(users.values()));
    }
  });

  // Handle disconnect
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

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

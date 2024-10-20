import express from "express";
import { WebSocketServer } from "ws";
import expressWs from "express-ws";
import cors from "cors";

const app = express();
var expressWs = require("express-ws")(app);
const port = 8080;

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080", "*"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

let clients: { podId: string; ws: WebSocket }[] = [];

app.get("/", (req, res) => {
  res.send("Welcome to brain pod!");
});

app.ws("/", (ws, req) => {
  clients.push({ podId: req.url.split("/.websocket?podId=")[1], ws: ws });

  ws.on("close", (ctx, req) => {
    clients = clients.filter((client) => client.ws !== ctx);
  });
});

app.post("/start", (req, res) => {
  let podId = req.body.podId;

  // Get context on pod (embeddings)

  // Generate question for pod

  // Register question on db

  // Send question to pod via websockets
  sendMessageToPods(podId, {
    type: "open",
    data: { question: "Whats up?" },
  });

  // timeout 1:30 minutes
  // Send end websocket message to client (3s trial)
  setTimeout(() => {
    sendMessageToPods(podId, {
      type: "close",
      data: {},
    });
  }, 3000);

  // analyze responses

  // If bad answers give feedback through chat (loop?)

  // Repeat
  res.send("Started");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

function sendMessageToPods(podId: string, data: any) {
  clients
    .filter((client) => client.podId === podId)
    .forEach((client) => {
      client.ws.send(JSON.stringify(data));
    });
}

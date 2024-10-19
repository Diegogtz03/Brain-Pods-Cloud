import express from "express";
import { WebSocketServer } from "ws";
import expressWs from "express-ws";

const app = express();
var expressWs = require("express-ws")(app);
const port = 8080;

let clients: { roomId: string; ws: WebSocket }[] = [];

app.ws("/", (ws, req) => {
  clients.push({ roomId: req.url.split("/.websocket?roomId=")[1], ws: ws });

  ws.on("close", (ctx, req) => {
    clients = clients.filter((client) => client.ws !== ctx);
  });
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/talk/:roomId", (req, res) => {
  // send message to all websocket with roomId
  clients
    .filter((client) => client.roomId === req.params.roomId)
    .forEach((client) => {
      client.ws.send(
        JSON.stringify({ message: "Whats up? roomId: " + req.params.roomId })
      );
    });

  res.send("Message sent");
});

app.post("/start", (req, res) => {
  res.send(req.body.roomId);
});

app.get("/open/:roomId", (req, res) => {
  console.log("connectione");
  // connect to websocket
  const ws = new WebSocket(`ws://localhost:8081/?roomId=${req.params.roomId}`);

  ws.onopen = () => {
    res.send("Connected");
    ws.send(JSON.stringify({ message: "Hello from client" }));
  };

  ws.onerror = (err) => {
    res.send("Error: " + err);
  };
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

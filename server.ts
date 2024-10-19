import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const port = 8080;

let clients: { roomId: string; ws: WebSocket }[] = [];

const wss = new WebSocketServer({
  port: parseInt(process.env.WS_PORT || "3100"),
});

wss.on("connection", (ctx, req) => {
  clients.push({ roomId: req.url.split("/")[1], ws: ctx });
});

wss.on("close", (ctx, req) => {
  clients = clients.filter((client) => client.ws !== ctx);
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
});

app.post("/start", (req, res) => {
  res.send(req.body.roomId);
});

// app.get("/open/:roomId", (req, res) => {
//   // connect to websocket
//   const ws = new WebSocket(
//     `ws://localhost:${process.env.WS_PORT}/${req.params.roomId}`
//   );
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

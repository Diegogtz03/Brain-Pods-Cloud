import express from "express";
import { WebSocketServer } from "ws";
import expressWs from "express-ws";

const app = express();
var expressWs = require("express-ws")(app);
const port = 8080;

let clients: { roomId: string; ws: WebSocket }[] = [];

// const wss = new WebSocketServer({
//   port: parseInt(process.env.WS_PORT || "8080"),
// });

app.ws("/", (ws, req) => {
  ws.on("connection", (ctx, req) => {
    clients.push({ roomId: req.url.split("/")[1], ws: ctx });
  });

  ws.on("close", (ctx, req) => {
    clients = clients.filter((client) => client.ws !== ctx);
  });
});

// wss.on("connection", (ctx, req) => {
//   clients.push({ roomId: req.url.split("/")[1], ws: ctx });
// });

// wss.on("close", (ctx, req) => {
//   clients = clients.filter((client) => client.ws !== ctx);
// });

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
  // connect to websocket
  const ws = new WebSocket(
    `ws://brain-pods-cloud-508208716471.us-central1.run.app/${req.params.roomId}`
  );

  ws.onopen = () => {
    res.send("Connected");
  };

  ws.onerror = (err) => {
    res.send("Error: " + err);
  };
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

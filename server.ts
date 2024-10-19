import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const port = 8080;

let wsSessions: WebSocket[] = [];

app.get("/new", (req, res) => {
  // You get ID of the session
  // const ws = new WebSocketServer({ noServer: true });
  // wsSessions.push(ws);
  res.send("New session created");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

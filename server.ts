import express from "express";
import { WebSocketServer } from "ws";
import expressWs from "express-ws";
import cors from "cors";

import { generateFeedback, generateQuestion } from "./utils/ai/task_runner";
import { Question, FeedbackResponse } from "./interfaces/ai";
import { insertQuestion, insertChatMessage } from "./utils/db/inserts/util";
import { getAnswers } from "./utils/db/selects/util";
const app = express();
app.use(express.json());
var expressWs = require("express-ws")(app);
const port = 8080;

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "*",
      "https://brain-pods.com/*",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "*"],
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

app.post("/start", async (req, res) => {
  let podId = req.body.podId;

  // Generate question for pod (AI)
  const question: Question = await generateQuestion(podId);

  // Register question on db
  const questionId = await insertQuestion(
    question.question,
    question.correct_index,
    question.answers,
    podId
  );

  // Send question to pod via websockets
  sendMessageToPods(podId, {
    type: "open",
    data: {
      question: question.question,
      answers: question.answers,
      id: questionId,
    },
  });

  const startTime = Date.now();
  const timeoutDuration = 20000; // 20 seconds
  let allAnswersReceived = false;

  while (Date.now() - startTime < timeoutDuration && !allAnswersReceived) {
    const answers = await getAnswers(podId, questionId);

    if (
      answers &&
      answers.length >= 2 &&
      answers.every((answer) => answer.correct !== null)
    ) {
      allAnswersReceived = true;
    } else {
      // Wait for a short interval before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (allAnswersReceived) {
    console.log("All answers received");
    sendMessageToPods(podId, {
      type: "close",
      data: {},
    });
  } else {
    console.log("Timeout reached");
    sendMessageToPods(podId, {
      type: "close",
      data: {},
    });
  }

  // analyze responses
  const answers = await getAnswers(podId, questionId);

  // If all answers are correct, send next question, else generate feedback and send it as chat
  if (answers?.every((answer) => answer.correct)) {
    console.log("All answers are correct");
  } else {
    const feedbacks: FeedbackResponse = await generateFeedback(
      podId,
      questionId,
      question.question,
      question.answers.map((answer) => answer.answer)
    );

    for (const feedback of feedbacks.feedbacks) {
      // setTimeout(() => {
      //   sendMessageToPods(podId, {
      //     type: "chat",
      //     data: { feedback },
      //   });
      // }, 1000);

      // Insert to chat_message table
      setTimeout(async () => {
        await insertChatMessage(podId, feedback);
      }, 1000);
    }
  }

  // End chat
  setTimeout(() => {
    sendMessageToPods(podId, {
      type: "close",
      data: {},
    });
  }, 1000);

  res.send("Completed");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

function sendMessageToPods(podId: string, data: object) {
  clients
    .filter((client) => client.podId === podId)
    .forEach((client) => {
      client.ws.send(JSON.stringify(data));
    });
}

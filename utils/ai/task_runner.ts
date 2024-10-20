import {
  getTags,
  getQuestions,
  getPublicPodChatMessages,
  getDocumentEmbeddings,
  getAnswers,
} from "../db/selects/util";
import { Question, FeedbackResponse } from "../../interfaces/ai";
import {
  FEEDBACK_GENERATOR_PROMPT,
  QUESTION_GENERATION_PROMPT,
} from "../promt_repo";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const generateQuestion = async (podId: string): Promise<Question> => {
  const API_KEY = process.env.GEMINI_API_KEY;

  console.log("POD ID", podId);

  // Get context on pod
  // --> Tags
  const tags = await getTags(podId);
  console.log("TAGS", tags);

  // --> Previous Questions
  const previousQuestions = await getQuestions(podId);
  console.log("PREVIOUS QUESTIONS", previousQuestions);

  // --> Chat Messages?
  const chatMessages = await getPublicPodChatMessages(podId);
  console.log("CHAT MESSAGES", chatMessages);

  // --> Document Embeddings
  const documentEmbeddings = await getDocumentEmbeddings(podId);
  console.log("DOCUMENT EMBEDDINGS", documentEmbeddings);

  // Call Gemini
  const gemini = new GoogleGenerativeAI(API_KEY ?? "");

  const finalPrompt = QUESTION_GENERATION_PROMPT(
    tags?.join(", ") ?? "",
    previousQuestions?.join(", ") ?? "",
    chatMessages?.join(", ") ?? "",
    documentEmbeddings?.join(", ") ?? ""
  );

  const responseSchema = {
    description: "Question",
    type: SchemaType.OBJECT,
    properties: {
      question: {
        type: SchemaType.STRING,
        description: "Question",
        nullable: false,
      },
      correct_index: {
        type: SchemaType.NUMBER,
        description: "Correct index",
        nullable: false,
      },
      answers: {
        type: SchemaType.ARRAY,
        description: "Answer",
        nullable: false,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            answer: { type: SchemaType.STRING },
            is_correct: { type: SchemaType.BOOLEAN },
          },
        },
      },
    },
    required: ["question", "correct_index", "answers"],
  };

  const model = gemini.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const result = await model.generateContent(finalPrompt);

  // Validate if can be parsed into Question
  const parsedResponse = JSON.parse(result.response.text());

  return parsedResponse;
};

//   tags: string,
// chatMessages: string,
// userInstructions: string

export const generateFeedback = async (
  podId: string,
  questionId: string,
  question: string,
  answerChoices: string[]
): Promise<FeedbackResponse> => {
  const API_KEY = process.env.GEMINI_API_KEY;

  // get wrong answers
  const answers = await getAnswers(podId, questionId);

  // --> Tags
  const tags = await getTags(podId);

  // --> Previous Questions
  const previousQuestions = await getQuestions(podId);

  // --> Chat Messages
  const chatMessages = await getPublicPodChatMessages(podId);

  // generate feedback (can be multiple feedbacks if wrong answers are related)
  const finalPrompt = FEEDBACK_GENERATOR_PROMPT(
    question,
    answerChoices.join(", "),
    answers?.join(", ") ?? "",
    tags?.join(", ") ?? "",
    chatMessages?.join(", ") ?? "",
    previousQuestions?.join(", ") ?? ""
  );

  // return feedback;
  const gemini = new GoogleGenerativeAI(API_KEY ?? "");

  const responseSchema = {
    description: "Feedback",
    type: SchemaType.OBJECT,
    properties: {
      feedbacks: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
  };

  const model = gemini.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const result = await model.generateContent(finalPrompt);

  const parsedResponse = JSON.parse(result.response.text());

  return parsedResponse;
};

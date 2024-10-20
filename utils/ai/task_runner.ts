import {
  getTags,
  getQuestions,
  getPublicPodChatMessages,
} from "../db/selects/util";
import { Question } from "../../interfaces/ai";
import { QUESTION_GENERATION_PROMPT } from "../promt_repo";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const generateQuestion = async (podId: string): Promise<Question> => {
  const API_KEY = process.env.GEMINI_API_KEY;

  // Get context on pod
  // --> Tags
  const tags = await getTags(podId);

  // --> Previous Questions
  const previousQuestions = await getQuestions(podId);

  // --> Chat Messages?
  const chatMessages = await getPublicPodChatMessages(podId);

  // --> Document Embeddings
  const documentEmbeddings =
    "Hi! I need to generate a study guide for goemtry, I'm in 7th grade. I want to learn about the pythagorean theorem. My study includes the following topics: pythagorean theorem, distance formula, and slope.";

  // Call Gemini
  const gemini = new GoogleGenerativeAI(API_KEY ?? "");

  const finalPrompt = QUESTION_GENERATION_PROMPT(
    tags?.join(", ") ?? "",
    previousQuestions?.join(", ") ?? "",
    chatMessages?.join(", ") ?? "",
    documentEmbeddings ?? ""
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

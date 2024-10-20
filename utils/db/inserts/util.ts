import { supabase } from "../../supabase";

export const insertQuestion = async (
  question: string,
  correct_index: number,
  answers: { answer: string; is_correct: boolean }[],
  podId: string
) => {
  const { data, error } = await supabase
    .from("pod_question")
    .insert({ question, pod_id: podId, index: correct_index, answers })
    .select();

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data[0].id;
};

export const insertChatMessage = async (podId: string, message: string) => {
  const { data, error } = await supabase.from("chat_message").insert({
    pod_id: podId,
    role: "AI",
    is_private: false,
    user_id: null,
    content: message,
    user_name: "AI",
  });

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data;
};

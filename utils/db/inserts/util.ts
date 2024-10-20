import { supabase } from "../../supabase";

export const insertQuestion = async (
  question: string,
  correct_index: number,
  answers: { answer: string; is_correct: boolean }[],
  podId: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .insert({ question, pod_id: podId, index: correct_index, answers })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0].id;
};

import { supabase } from "../../supabase";

export const insertQuestion = async (
  question: string,
  correct_index: number,
  answers: { answer: string; is_correct: boolean }[],
  podId: string
) => {
  // {
  //   question: <question>,
  //   correct_index: <index>,
  //   answer: [
  //     {
  //       answer: <answer>,
  //       is_correct: <true/false>
  //     }
  //   ]
  // }

  // Get

  const { data, error } = await supabase
    .from("questions")
    .insert({ question, pod_id: podId });
};

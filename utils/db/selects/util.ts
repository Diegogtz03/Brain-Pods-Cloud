import { supabase } from "../../supabase";

export const getQuestions = async (podId: string) => {
  const { data, error } = await supabase
    .from("pod_question")
    .select("*")
    .eq("pod_id", podId);

  return data;
};

export const getTags = async (podId: string) => {
  const { data, error } = await supabase
    .from("pod_topic")
    .select("topic_name")
    .eq("pod_id", podId);

  return data;
};

export const getPublicPodChatMessages = async (podId: string) => {
  const { data, error } = await supabase
    .from("chat_message")
    .select("user_name, role, content")
    .eq("pod_id", podId)
    .eq("is_private", false);

  return data;
};

export const getDocumentEmbeddings = async (podId: string) => {
  const { data, error } = await supabase
    .from("pod")
    .select("embedding")
    .eq("id", podId);

  return data;
};

export const getAnswers = async (podId: string, questionId: string) => {
  const { data, error } = await supabase
    .from("pod_question_answer")
    .select("answer_index, user_id, correct, question_id")
    .eq("pod_id", podId)
    .eq("question_id", questionId);

  return data;
};

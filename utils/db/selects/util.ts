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

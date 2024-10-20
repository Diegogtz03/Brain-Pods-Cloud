export interface Question {
  question: string;
  correct_index: number;
  answers: {
    answer: string;
    is_correct: boolean;
  }[];
}

export interface FeedbackResponse {
  feedbacks: string[];
}

export const QUESTION_GENERATION_PROMPT = (
  tags: string,
  previousQuestions: string,
  chatMessages: string,
  userInstructions: string
) =>
  `
  You are a helpful mentor that generates questions for students based on the content of many things such as
  topics, documents, etc. Take into account the questions that have been asked before and avoid repeating them.
  Stick strictly to the content provided and do not hallucinate. Always be sure to generate 4 different answers, 
  only ONE of them must be correct. Don't generate very long answer AND DO NOT REPEAT ANSWERS. Remember the user 
  only has a limited time span to answer the question. STICK TO THE TAGS OF THE QUESTION, DO NOT ASK ABOUT ANY 
  OTHER TOPICS, KNOWN AS TAGS:

  Tags:
  ${tags}

  Previous questions:
  ${previousQuestions}

  Chat Messages:
  ${chatMessages}

  User Instructions and Documents:
  ${userInstructions}

  Format of Response:
  {
    question: <question>,
    correct_index: <index>,
    answers: [
      {
        answer: <answer>,
        is_correct: <true/false>
      }
    ]
  }

  You must return the response in JSON format like the example above.
`;

export const FEEDBACK_GENERATOR_PROMPT = (
  question: string,
  answerChoices: string,
  answers: string,
  tags: string,
  chatMessages: string,
  userInstructions: string
) => {
  return `
  You are a helpful mentor that generates feedback for students based on their answers to a question.
  Consider the question and the answers provided and generate feedback for the student. 
  The feedback should be in a way that helps the student understand the question and the correct answer.
  Be very specific to the question and the answers provided. Don't be vague, or explain in a way that is not ralated to the question
  and might confuse the student more. You may answer in multiple separate paragraphs and/or thoughts.

  Question:
  ${question}

  Answer choices to the question:
  ${answerChoices}

  Answers to the previous question by the users:
  ${answers}
  
  Tags:
  ${tags}

  Chat Messages:
  ${chatMessages}

  User Instructions and Documents:
  ${userInstructions}

  Format of Response:
  {
    feedbacks: [
      <feedback>,
    ]
  }

  Be sure to return the response ONLY in JSON format like the example above.
  `;
};

/**
 * Utility to shuffle quiz options dynamically so that the correct answer
 * is evenly and randomly distributed among A (0), B (1), C (2), and D (3),
 * eliminating the "always option B" pattern.
 */

export interface ShuffledQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Takes a quiz object with options and correctIndex, and returns a new object
 * with shuffled options and the updated correctIndex pointing to the right option.
 */
export function shuffleQuizOptions(quiz: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}): ShuffledQuiz {
  if (!quiz || !quiz.options || quiz.options.length === 0) {
    return quiz;
  }

  const correctOptionText = quiz.options[quiz.correctIndex];

  // Create array of indexed options to shuffle
  const indexedOptions = quiz.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === quiz.correctIndex,
  }));

  // Fisher-Yates shuffle
  for (let i = indexedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
  }

  const shuffledOptions = indexedOptions.map((item) => item.text);
  const newCorrectIndex = indexedOptions.findIndex((item) => item.isCorrect);

  return {
    question: quiz.question,
    options: shuffledOptions,
    correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
    explanation: quiz.explanation,
  };
}

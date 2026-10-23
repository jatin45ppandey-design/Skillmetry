import "server-only";

import { curriculumCatalog, curriculumTopicById } from "@skillmetry/shared/data/curriculum";
import { skillById } from "@skillmetry/shared/data/catalog";
import type { CurriculumDifficulty, CurriculumTopicId } from "@skillmetry/shared/types/curriculum";

type TopicPracticeQuestion = {
  id: string;
  topicId: CurriculumTopicId;
  skillId: string;
  difficulty: CurriculumDifficulty;
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
  hint: string;
  explanation: string;
};

function rotatedChoices(correct: string, distractors: readonly string[], offset: number) {
  const choices = [correct, ...distractors.slice(0, 3)];
  const shift = offset % choices.length;
  return {
    choices: [...choices.slice(shift), ...choices.slice(0, shift)],
    correctIndex: (choices.length - shift) % choices.length
  };
}

function questionsForTopic(topicId: CurriculumTopicId): TopicPracticeQuestion[] {
  const topic = curriculumTopicById[topicId];
  if (!topic) return [];
  const subtopic = curriculumCatalog.subtopics.find(item => item.topicId === topic.id);
  const lesson = subtopic
    ? curriculumCatalog.lessons.find(item => item.subtopicId === subtopic.id)
    : undefined;
  const skillId = topic.skillIds[0];
  if (!lesson || !skillId) return [];
  const skillLabel = skillById[skillId]?.label ?? skillId;
  const mistakes = lesson.commonMistakes;
  const definitions = [
    {
      prompt: `Which approach best supports this ${skillLabel} objective: “${topic.learningObjectives[0]}”?`,
      correct: `Work toward this outcome: ${topic.learningOutcomes[0]}.`,
      distractors: [
        `Use this shortcut instead: ${mistakes[0]}.`,
        `Ignore the lesson boundary and ${mistakes[1] ?? mistakes[0].toLowerCase()}.`,
        "Skip validation and infer success from a single happy-path example."
      ],
      hint: `Look for the choice that matches the stated outcome, not one of the lesson's common mistakes.`,
      explanation: lesson.explanation
    },
    {
      prompt: `Before attempting “${lesson.task}”, what is the strongest first move?`,
      correct: `Define one observable step that applies: ${topic.learningObjectives[0]}.`,
      distractors: [
        `Begin by ${mistakes[0].toLowerCase()}.`,
        "Add complexity before stating the expected input and result.",
        "Treat completion as proof that every edge case works."
      ],
      hint: "Start with a small, reviewable step whose result you can inspect.",
      explanation: `${lesson.summary} ${lesson.explanation}`
    },
    {
      prompt: `Which statement best matches the lesson “${lesson.title}”?`,
      correct: lesson.summary,
      distractors: [
        mistakes[0],
        mistakes[1] ?? "A shortcut is sufficient when the first example passes.",
        "This topic is useful only after every advanced tool has been learned."
      ],
      hint: `Recall the worked example: ${lesson.example}`,
      explanation: `${lesson.explanation} A useful next step is: ${lesson.task}`
    }
  ];
  return definitions.map((definition, index) => {
    const arranged = rotatedChoices(definition.correct, definition.distractors, topic.order + index);
    return {
      id: `${topic.id}:practice:${index + 1}`,
      topicId: topic.id,
      skillId,
      difficulty: topic.difficulty,
      prompt: definition.prompt,
      choices: arranged.choices,
      correctIndex: arranged.correctIndex,
      hint: definition.hint,
      explanation: definition.explanation
    };
  });
}

export function listTopicPracticeQuestions(topicId: string) {
  if (!Object.prototype.hasOwnProperty.call(curriculumTopicById, topicId)) return [];
  return questionsForTopic(topicId as CurriculumTopicId);
}

export function topicPracticeCoverage() {
  return curriculumCatalog.topics.map(topic => ({
    topicId: topic.id,
    skillId: topic.skillIds[0],
    questionCount: questionsForTopic(topic.id).length
  }));
}

export function publicTopicPracticeQuestions(topicId: string) {
  return listTopicPracticeQuestions(topicId).map(question => ({
    id: question.id,
    topicId: question.topicId,
    skillId: question.skillId,
    difficulty: question.difficulty,
    prompt: question.prompt,
    choices: question.choices,
    hint: question.hint
  }));
}

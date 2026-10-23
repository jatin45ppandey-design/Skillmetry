import {describe,expect,it} from "vitest";
import {curriculumCatalog} from "@skillmetry/shared/data/curriculum";
import {listTopicPracticeQuestions,publicTopicPracticeQuestions,topicPracticeCoverage} from "@skillmetry/backend/lib/learning/topic-practice-bank.server";
import {listLabExercises} from "@skillmetry/backend/lib/learning/lab-bank.server";

describe("Phase 3 curriculum practice coverage",()=>{
  it("links every Phase 2 topic and lesson to three server-checked exercises",()=>{
    const coverage=topicPracticeCoverage();
    expect(coverage).toHaveLength(curriculumCatalog.topics.length);
    expect(coverage.every(item=>item.questionCount===3)).toBe(true);
    expect(new Set(coverage.map(item=>item.skillId)).size).toBe(42);
    for(const lesson of curriculumCatalog.lessons){
      expect(lesson.practiceIds.some(id=>id.startsWith("topic-practice:"))).toBe(true);
    }
  });
  it("keeps answer keys and explanations out of public topic payloads",()=>{
    for(const topic of curriculumCatalog.topics){
      const privateItems=listTopicPracticeQuestions(topic.id);
      const publicItems=publicTopicPracticeQuestions(topic.id);
      expect(privateItems).toHaveLength(3);expect(publicItems).toHaveLength(3);
      expect(JSON.stringify(publicItems)).not.toContain("correctIndex");
      expect(JSON.stringify(publicItems)).not.toContain("explanation");
      expect(privateItems.every(item=>item.hint.length>20&&item.explanation.length>20)).toBe(true);
    }
  });
  it("provides a guided entry point for all 18 skills without claiming execution",()=>{
    const exercises=listLabExercises();
    expect(new Set(exercises.map(item=>item.skillId)).size).toBe(18);
    expect(exercises.every(item=>item.executionMode==="reference-check"&&item.topicId&&item.lessonHref)).toBe(true);
    expect(JSON.stringify(exercises)).not.toContain("solution");
  });
});

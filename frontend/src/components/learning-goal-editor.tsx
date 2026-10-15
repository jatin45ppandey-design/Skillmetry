"use client";

import { Check, Circle } from "lucide-react";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import { learningTools } from "@skillmetry/shared/data/learning-catalog";
import type { CareerId, LearningPreferences, SkillId, ToolId } from "@skillmetry/shared/types/domain";

type LearningGoalEditorProps = {
  value: LearningPreferences;
  onChange: (value: LearningPreferences) => void;
  compact?: boolean;
};

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

export function LearningGoalEditor({ value, onChange, compact = false }: LearningGoalEditorProps) {
  function setCareer(primaryCareerId: CareerId | null) {
    onChange({ ...value, primaryCareerId });
  }

  function setSkill(skillId: SkillId) {
    onChange({ ...value, selectedSkillIds: toggle(value.selectedSkillIds, skillId) });
  }

  function setTool(toolId: ToolId) {
    onChange({ ...value, selectedToolIds: toggle(value.selectedToolIds, toolId) });
  }

  return <div className={`learning-goal-editor ${compact ? "compact" : ""}`}>
    <section className="learning-goal-group" aria-labelledby="primary-career-label">
      <div className="learning-goal-heading"><div><span className="eyebrow">Optional direction</span><h3 id="primary-career-label">Primary career track</h3></div><button className="text-button" type="button" onClick={() => setCareer(null)} disabled={!value.primaryCareerId}>Clear</button></div>
      <div className="learning-career-grid">
        {careers.map(career => {
          const selected = value.primaryCareerId === career.id;
          return <button type="button" key={career.id} className={`learning-choice career ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={() => setCareer(selected ? null : career.id)}>
            <span className="choice-check" aria-hidden="true">{selected ? <Check/> : <Circle/>}</span><span><strong>{career.title}</strong><small>{career.subtitle}</small></span>
          </button>;
        })}
      </div>
    </section>

    <section className="learning-goal-group" aria-labelledby="individual-skills-label">
      <div className="learning-goal-heading"><div><span className="eyebrow">Build your focus</span><h3 id="individual-skills-label">Individual skills</h3></div><span className="selection-count">{value.selectedSkillIds.length}/18 selected</span></div>
      <div className="learning-skill-grid">
        {skills.map(skill => {
          const selected = value.selectedSkillIds.includes(skill.id);
          return <button type="button" key={skill.id} className={`learning-choice skill ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={() => setSkill(skill.id)}><span>{skill.label}</span><small>{skill.group}</small></button>;
        })}
      </div>
    </section>

    <section className="learning-goal-group" aria-labelledby="tools-label">
      <div className="learning-goal-heading"><div><span className="eyebrow">Workflow focus</span><h3 id="tools-label">Tools & technologies</h3></div><span className="selection-count">{value.selectedToolIds.length}/4 selected</span></div>
      <div className="learning-tool-grid">
        {learningTools.map(tool => {
          const selected = value.selectedToolIds.includes(tool.id);
          return <button type="button" key={tool.id} className={`learning-choice tool ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={() => setTool(tool.id)}><span className="choice-check" aria-hidden="true">{selected ? <Check/> : <Circle/>}</span><span><strong>{tool.label}</strong><small>{tool.canonicalSkillId ? "Maps to the canonical Docker skill" : tool.description}</small></span></button>;
        })}
      </div>
    </section>
  </div>;
}

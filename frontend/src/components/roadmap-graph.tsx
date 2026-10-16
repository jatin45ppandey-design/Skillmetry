"use client";

import { useMemo } from "react";
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { skillById } from "@skillmetry/shared/data/catalog";
import { clamp, getSkillState, type SkillState } from "@skillmetry/shared/lib/readiness";
import type { SkillMap } from "@skillmetry/shared/types/domain";

type SkillNodeData = {
  title: string;
  score: number | null;
  typeLabel: string;
  status: SkillState;
  selected: boolean;
  recommended: boolean;
  related: boolean;
} & Record<string, unknown>;

function SkillNode({ data }: NodeProps<Node<SkillNodeData>>) {
  const stateLabel = data.status === "strong" ? "Strong Quiz Performance" : data.status === "unassessed" ? "Assessment Recommended" : data.status === "blocked" ? "Prerequisite unassessed" : "Developing";
  return <div className={`flow-node state-${data.status} ${data.selected ? "selected" : ""} ${data.recommended ? "recommended" : ""} ${data.related ? "is-related" : "is-muted"}`}>
    <Handle type="target" position={Position.Top} className="flow-handle"/>
    <div className="flow-node-top"><span className="flow-group">{data.typeLabel}</span><span className="flow-score">{data.score === null ? "N/A" : data.score}</span></div>
    <div className="flow-title">{data.title}</div>
    {data.score === null ? <div className="flow-evidence-unknown"><i/>No measured score</div> : <div className="progress-track compact" aria-label={`${data.score}% trusted quiz score`}><div className="progress-fill" style={{ width: `${data.score}%` }}/></div>}
    <div className="flow-small">{data.recommended ? "Recommended next step" : stateLabel}</div>
    <Handle type="source" position={Position.Bottom} className="flow-handle"/>
  </div>;
}

const nodeTypes = { skill: SkillNode };

function depthOf(id: string, included: Set<string>, memo: Map<string, number>, visiting = new Set<string>()): number {
  if (memo.has(id)) return memo.get(id)!;
  if (visiting.has(id)) return 0;
  visiting.add(id);
  const prerequisites = skillById[id].prerequisites.filter(item => included.has(item));
  const depth = prerequisites.length ? 1 + Math.max(...prerequisites.map(item => depthOf(item, included, memo, visiting))) : 0;
  memo.set(id, depth);
  visiting.delete(id);
  return depth;
}

export function RoadmapGraph({ skillIds, proficiency, selectedId, onSelect, visibleIds, recommendedIds = new Set<string>() }: { skillIds: string[]; proficiency: SkillMap; selectedId?: string; onSelect?: (skillId: string) => void; visibleIds?: Set<string>; recommendedIds?: Set<string> }) {
  const { nodes, edges } = useMemo(() => {
    const included = new Set<string>();
    const add = (id: string) => {
      if (included.has(id) || !skillById[id]) return;
      included.add(id);
      skillById[id].prerequisites.forEach(add);
    };
    skillIds.forEach(add);
    const shown = visibleIds ? new Set([...included].filter(id => visibleIds.has(id))) : included;
    // Visually foreground real prerequisite connections for the selected skill.
    // This affects presentation only; no new edges or scores are inferred.
    const related = new Set<string>();
    if (selectedId && shown.has(selectedId)) {
      function includePrerequisites(id: string) {
        if (related.has(id) || !shown.has(id)) return;
        related.add(id);
        skillById[id].prerequisites.forEach(includePrerequisites);
      }
      includePrerequisites(selectedId);
      shown.forEach(id => {
        if (skillById[id].prerequisites.includes(selectedId)) related.add(id);
      });
    }
    const memo = new Map<string, number>();
    const columns = new Map<number, string[]>();
    [...included].forEach(id => {
      if (!shown.has(id)) return;
      const depth = depthOf(id, included, memo);
      columns.set(depth, [...(columns.get(depth) ?? []), id]);
    });
    const nodes: Node<SkillNodeData>[] = [];
    for (const [level, ids] of [...columns].sort(([a], [b]) => a - b)) {
      ids.forEach((id, index) => {
        const skill = skillById[id];
        const score = Object.hasOwn(proficiency, id) ? clamp(proficiency[id]) : null;
        nodes.push({ id, type: "skill", position: { x: index * 244 - level * 10, y: level * 176 }, data: { title: skill.label, score, typeLabel: skill.group, status: getSkillState(id, proficiency), selected: selectedId === id, recommended: recommendedIds.has(id), related: !selectedId || related.has(id) } });
      });
    }
    const edges: Edge[] = [];
    shown.forEach(id => skillById[id].prerequisites.forEach(prerequisite => {
      if (shown.has(prerequisite)) edges.push({ id: `${prerequisite}-${id}`, source: prerequisite, target: id, type: "smoothstep", style: { stroke: "#8da98e", strokeWidth: 1.7, opacity: selectedId && !related.has(id) ? 0.28 : 1 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#8da98e" } });
    }));
    return { nodes, edges };
  }, [proficiency, recommendedIds, selectedId, skillIds, visibleIds]);

  return <div className="flow-wrap"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => onSelect?.(node.id)} fitView fitViewOptions={{ padding: .2 }} minZoom={.25} maxZoom={1.35} nodesDraggable={false} nodesConnectable={false} nodesFocusable proOptions={{ hideAttribution: false }}><Background color="#d0dccb" gap={24} size={1}/><MiniMap zoomable pannable nodeColor={node => node.id === selectedId ? "#356343" : "#bbd4b8"} maskColor="#faf7eece"/><Controls showInteractive={false}/></ReactFlow></div>;
}

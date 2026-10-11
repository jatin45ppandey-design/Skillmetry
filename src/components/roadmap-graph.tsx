"use client";

import { useMemo } from "react";
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type NodeProps, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { skillById } from "@/data/catalog";
import type { Career, SkillMap } from "@/types/domain";
import { clamp, getSkillState, type SkillState } from "@/lib/readiness";

type SkillNodeData = { title:string; score:number; typeLabel:string; status:SkillState; selected:boolean } & Record<string,unknown>;

function SkillNode({data}:NodeProps<Node<SkillNodeData>>) {
  const stateLabel = data.status === "strong" ? "Strong estimate" : data.status === "available" ? "Ready to start" : data.status === "blocked" ? "Prerequisite pending" : "In progress";
  return <div className={`flow-node state-${data.status} ${data.selected ? "selected" : ""}`}><Handle type="target" position={Position.Top} className="flow-handle"/><div className="flow-node-top"><span className="flow-group">{data.typeLabel}</span><span className="flow-score">{data.score}</span></div><div className="flow-title">{data.title}</div><div className="progress-track compact"><div className="progress-fill" style={{width:`${data.score}%`}}/></div><div className="flow-small">{stateLabel}</div><Handle type="source" position={Position.Bottom} className="flow-handle"/></div>;
}

const nodeTypes = { skill:SkillNode };

function depthOf(id:string,included:Set<string>,memo:Map<string,number>,visiting=new Set<string>()):number {
  if (memo.has(id)) return memo.get(id)!;
  if (visiting.has(id)) return 0;
  visiting.add(id);
  const prerequisites = skillById[id].prerequisites.filter(item => included.has(item));
  const depth = prerequisites.length ? 1 + Math.max(...prerequisites.map(item => depthOf(item,included,memo,visiting))) : 0;
  memo.set(id,depth);
  visiting.delete(id);
  return depth;
}

export function RoadmapGraph({career,proficiency,selectedId,onSelect,visibleIds}:{career:Career;proficiency:SkillMap;selectedId?:string;onSelect?:(skillId:string)=>void;visibleIds?:Set<string>}) {
  const {nodes,edges} = useMemo(() => {
    const included = new Set<string>();
    const add = (id:string) => { if (included.has(id)) return; included.add(id); skillById[id].prerequisites.forEach(add); };
    career.skills.forEach(skill => add(skill.skillId));
    const shown = visibleIds ? new Set([...included].filter(id => visibleIds.has(id))) : included;
    const memo = new Map<string,number>();
    const columns = new Map<number,string[]>();
    [...included].forEach(id => { if (!shown.has(id)) return; const depth = depthOf(id,included,memo); columns.set(depth,[...(columns.get(depth) ?? []),id]); });
    const nodes:Node<SkillNodeData>[] = [];
    for (const [level,ids] of [...columns].sort(([a],[b]) => a-b)) {
      ids.forEach((id,index) => { const skill = skillById[id]; const score = clamp(proficiency[id] ?? 0); nodes.push({id,type:"skill",position:{x:index*244-level*10,y:level*176},data:{title:skill.label,score,typeLabel:skill.group,status:getSkillState(id,proficiency),selected:selectedId === id}}); });
    }
    const edges:Edge[] = [];
    shown.forEach(id => skillById[id].prerequisites.forEach(prerequisite => { if (shown.has(prerequisite)) edges.push({id:`${prerequisite}-${id}`,source:prerequisite,target:id,type:"smoothstep",style:{stroke:"#47657e",strokeWidth:1.4},markerEnd:{type:MarkerType.ArrowClosed,color:"#47657e"}}); }));
    return {nodes,edges};
  },[career,proficiency,selectedId,visibleIds]);

  return <div className="flow-wrap"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_,node)=>onSelect?.(node.id)} fitView fitViewOptions={{padding:.2}} minZoom={.25} maxZoom={1.35} nodesDraggable={false} nodesConnectable={false} nodesFocusable proOptions={{hideAttribution:false}}><Background color="#25394f" gap={24} size={1}/><MiniMap zoomable pannable nodeColor={node => node.id === selectedId ? "#22d3ee" : "#31536b"} maskColor="#07101bd6"/><Controls showInteractive={false}/></ReactFlow></div>;
}

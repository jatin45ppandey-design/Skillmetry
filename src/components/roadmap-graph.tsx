"use client";
import { useMemo } from "react";
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type NodeProps, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { skillById } from "@/data/catalog";
import type { Career, SkillMap } from "@/types/domain";
import { clamp } from "@/lib/readiness";

type SkillNodeData = { title:string; score:number; typeLabel:string; status:"ready"|"next"|"learning" } & Record<string,unknown>;
function SkillNode({data}: NodeProps<Node<SkillNodeData>>){
 return <div className={`flow-node ${data.status}`}><Handle type="target" position={Position.Top} style={{opacity:0}}/>
 <div className="flow-title">{data.title}</div><div className="flow-small">{data.typeLabel} • {data.score}/100</div>
 <div className="progress-track" style={{marginTop:11,height:5}}><div className="progress-fill" style={{width:`${data.score}%`}}/></div>
 <Handle type="source" position={Position.Bottom} style={{opacity:0}}/></div>;
}
const nodeTypes = { skill:SkillNode };
function depthOf(id:string,included:Set<string>,memo:Map<string,number>,visiting=new Set<string>()):number {
 if(memo.has(id))return memo.get(id)!;
 if(visiting.has(id))return 0;
 visiting.add(id); const prereqs=skillById[id].prerequisites.filter(x=>included.has(x));
 const depth=prereqs.length?1+Math.max(...prereqs.map(x=>depthOf(x,included,memo,visiting))):0;
 memo.set(id,depth); visiting.delete(id);return depth;
}
export function RoadmapGraph({career,proficiency}:{career:Career;proficiency:SkillMap}){
 const {nodes,edges}=useMemo(()=>{
  // Include transitive prerequisites for a complete DAG, even when not weighted in the role.
  const included=new Set<string>();const add=(id:string)=>{if(included.has(id))return;included.add(id);skillById[id].prerequisites.forEach(add);};career.skills.forEach(s=>add(s.skillId));
  const memo=new Map<string,number>();const columns=new Map<number,string[]>();[...included].forEach(id=>{const d=depthOf(id,included,memo);columns.set(d,[...(columns.get(d)||[]),id]);});
  const nodes:Node<SkillNodeData>[]=[];for(const [level,ids] of [...columns].sort(([a],[b])=>a-b)){
   ids.forEach((id,index)=>{const s=skillById[id];const score=clamp(proficiency[id]??0);const blocked=s.prerequisites.some(p=>clamp(proficiency[p]??0)<50);
   nodes.push({id,type:"skill",position:{x:index*255-level*15,y:level*165},data:{title:s.label,score,typeLabel:blocked?"Prerequisite pending":s.group,status:score>=70?"ready":!blocked?"next":"learning"}});
  });}
  const edges:Edge[]=[];included.forEach(id=>skillById[id].prerequisites.forEach(pre=>{if(included.has(pre))edges.push({id:`${pre}-${id}`,source:pre,target:id,type:"smoothstep",animated:false,style:{stroke:"#56768e",strokeWidth:1.4},markerEnd:{type:MarkerType.ArrowClosed,color:"#56768e"}});}));
  return {nodes,edges};
 },[career,proficiency]);
 return <div className="flow-wrap"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{padding:.18}} minZoom={.2} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} proOptions={{hideAttribution:false}}><Background color="#24334B" gap={22} size={1}/><MiniMap zoomable pannable nodeColor="#1A839B" maskColor="#06101ab5"/><Controls/></ReactFlow></div>;
}

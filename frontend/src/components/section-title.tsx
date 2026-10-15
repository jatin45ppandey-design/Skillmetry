export function SectionTitle({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:React.ReactNode}){
  return <header className="section-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action ? <div className="section-action">{action}</div> : null}</header>;
}

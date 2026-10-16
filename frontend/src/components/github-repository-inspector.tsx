"use client";
import {useState} from "react";
import {parsePublicRepositoryUrl} from "@skillmetry/shared/lib/github-evidence";

type Repo={name:string;url:string;description:string|null;archived:boolean;stars:number;lastPush:string|null;defaultBranch:string|null;linkedGitHubOwner:boolean};
export function GitHubRepositoryInspector({url}:{url:string|null}) {
  const [repo,setRepo]=useState<Repo|null>(null);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const pointer=url?parsePublicRepositoryUrl(url):null;
  if(!pointer)return null;
  async function inspect(){
    setPending(true);setError(null);setRepo(null);
    try{
      const response=await fetch("/api/github/repository?url="+encodeURIComponent(url!),{cache:"no-store"});
      const body=await response.json() as {repository?:Repo;error?:string};
      if(!response.ok||!body.repository)throw new Error(body.error??"GitHub metadata is unavailable.");
      setRepo(body.repository);
    }catch(cause){setError(cause instanceof Error?cause.message:"GitHub metadata is unavailable.");}
    finally{setPending(false);}
  }
  return <div className="studio-ai-option">
    <strong>Public GitHub evidence</strong>
    <p>Inspect public repository metadata only. No GitHub account access, private code, or skill verification.</p>
    <button type="button" className="btn btn-outline" disabled={pending} onClick={()=>void inspect()}>
      {pending?"Checking public repository…":"Inspect public GitHub details"}
    </button>
    {error?<p role="alert">{error}</p>:null}
    {repo?<div className="studio-ai-results" role="status">
      <strong>{repo.name}</strong>
      {repo.description?<p>{repo.description}</p>:null}
      <p>Public stars: {repo.stars} · {repo.archived?"Archived":"Not archived"} · {repo.defaultBranch??"Unknown"} branch</p>
      {repo.lastPush?<p>Last repository push: {new Date(repo.lastPush).toLocaleDateString()}</p>:null}
      <a href={repo.url} target="_blank" rel="noopener noreferrer">Open GitHub repository ↗</a>
      <p>{repo.linkedGitHubOwner
        ? "Public owner ID matches your linked GitHub account. Authorship and proficiency remain unverified."
        : "Repository ownership is not verified by your linked GitHub identity."}</p>
      <small>Repository stars, visibility and public owner identity are NOT proof of code authorship, project review or skill proficiency.</small>
    </div>:null}
  </div>;
}

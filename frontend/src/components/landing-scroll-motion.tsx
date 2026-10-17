"use client";

import {useEffect} from "react";

/** Decorative feedback only: never hides content before Javascript or an observer is ready. */
export function LandingScrollMotion(){
 useEffect(()=>{
  if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const sections=document.querySelectorAll<HTMLElement>(".lc-site [data-reveal]");
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const node=entry.target as HTMLElement;
      node.classList.add("sx-reveal-active");
      observer.unobserve(node);
    }
  },{threshold:.08,rootMargin:"0px 0px -30px 0px"});
  sections.forEach(node=>observer.observe(node));
  return()=>observer.disconnect();
 },[]);
 return null;
}

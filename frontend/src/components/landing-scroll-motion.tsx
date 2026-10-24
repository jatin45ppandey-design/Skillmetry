"use client";

import {useEffect} from "react";

/** Decorative feedback only: never hides content before Javascript or an observer is ready. */
export function LandingScrollMotion(){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>("[data-landing-root]");
  if(!root||!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const reveals=root.querySelectorAll<HTMLElement>("[data-reveal]");
  const sections=root.querySelectorAll<HTMLElement>("[data-story-section]");
  root.dataset.motionReady="true";
  reveals.forEach(node=>{
   Array.from(node.querySelectorAll<HTMLElement>("[data-reveal-part]"))
    .forEach((part,index)=>part.style.setProperty("--reveal-index",String(index)));
  });
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const node=entry.target as HTMLElement;
      node.classList.add("sx-reveal-active");
      observer.unobserve(node);
    }
  },{threshold:.08,rootMargin:"0px 0px -30px 0px"});
  const sectionObserver=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting)
    .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(visible)root.dataset.activeSection=(visible.target as HTMLElement).dataset.storySection ?? "";
  },{threshold:[.2,.45,.7],rootMargin:"-18% 0px -48% 0px"});
  reveals.forEach(node=>observer.observe(node));
  sections.forEach(node=>sectionObserver.observe(node));
  // Reveals enhance the reading sequence, but content must never depend on an
  // observer continuing to fire (automation, background tabs, browser quirks).
  const revealFallback=window.setTimeout(()=>{
   reveals.forEach(node=>node.classList.add("sx-reveal-active"));
  },2500);

  let frame=0;
  const updateProgress=()=>{
   frame=0;
   const bounds=root.getBoundingClientRect();
   const travel=Math.max(1,bounds.height-window.innerHeight);
   const progress=Math.min(1,Math.max(0,-bounds.top/travel));
   root.style.setProperty("--story-progress",progress.toFixed(4));
  };
  const onScroll=()=>{
   if(frame)return;
   frame=window.requestAnimationFrame(updateProgress);
  };
  const updateHeader=()=>{root.dataset.scrolled=window.scrollY>12?"true":"false";};
  const onPageScroll=()=>{onScroll();updateHeader();};
  updateHeader();
  updateProgress();
  window.addEventListener("scroll",onPageScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  return()=>{
   observer.disconnect();
   sectionObserver.disconnect();
   window.clearTimeout(revealFallback);
   window.removeEventListener("scroll",onPageScroll);
   window.removeEventListener("resize",onScroll);
   if(frame)window.cancelAnimationFrame(frame);
   delete root.dataset.motionReady;
   delete root.dataset.scrolled;
  };
 },[]);
 return null;
}

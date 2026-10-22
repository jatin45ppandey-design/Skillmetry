"use client";
import {Suspense, useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";

function RouteProgressInner(){
 const pathname=usePathname();
 const search=useSearchParams();
 const route=pathname+"?"+search.toString();
 const [opening,setOpening]=useState(false);
 const revealTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const fallbackTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pendingLink=useRef<HTMLAnchorElement|null>(null);
 const hide=useCallback(()=>{
   if(revealTimer.current)clearTimeout(revealTimer.current);
   if(fallbackTimer.current)clearTimeout(fallbackTimer.current);
   revealTimer.current=null;
   fallbackTimer.current=null;
   pendingLink.current?.removeAttribute("data-route-pending");
   pendingLink.current=null;
   document.documentElement.removeAttribute("data-route-pending");
   setOpening(false);
 },[]);
 const begin=useCallback((link?:HTMLAnchorElement)=>{
   hide();
   document.documentElement.dataset.routePending="true";
   if(link){
     pendingLink.current=link;
     link.dataset.routePending="true";
   }
   // Click feedback is immediate; the progress track appears only when the
   // route takes long enough to be perceptible.
   revealTimer.current=setTimeout(()=>setOpening(true),180);
   fallbackTimer.current=setTimeout(hide,12000);
 },[hide]);
 useEffect(()=>{
   hide();
 },[route,hide]);
 useEffect(()=>{
   function onClick(event:MouseEvent){
     if(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
     const node=event.target;
     if(!(node instanceof Element))return;
     const link=node.closest("a[href]");
     if(!(link instanceof HTMLAnchorElement)||link.target && link.target!=="_self" ||
       link.hasAttribute("download"))return;
     const href=new URL(link.href,window.location.href);
     if(href.origin!==window.location.origin)return;
     const current=window.location.pathname+window.location.search;
     const destination=href.pathname+href.search;
     if(destination===current||href.hash && destination===current)return;
     begin(link);
   }
   function onPop(){begin();}
   function onBeforeUnload(){
     document.documentElement.dataset.routePending="true";
     setOpening(true);
   }
   document.addEventListener("click",onClick,true);
   window.addEventListener("popstate",onPop);
   window.addEventListener("beforeunload",onBeforeUnload);
   return()=>{
     document.removeEventListener("click",onClick,true);
     window.removeEventListener("popstate",onPop);
     window.removeEventListener("beforeunload",onBeforeUnload);
     hide();
   };
 },[begin,hide]);
 return <div className={"motion-route-progress"+(opening?" is-opening":"")} role="status" aria-live="polite" aria-atomic="true">
   {opening?<span className="sr-only">Opening the next page</span>:null}
   <span className="motion-route-progress-track" aria-hidden="true"/>
 </div>;
}
export function NavigationProgress(){
 return <Suspense fallback={null}><RouteProgressInner/></Suspense>;
}

"use client";
import {Suspense, useEffect, useRef, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";

function RouteProgressInner(){
 const pathname=usePathname();
 const search=useSearchParams();
 const route=pathname+"?"+search.toString();
 const [opening,setOpening]=useState(false);
 const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const routeRef=useRef(route);
 const hide=()=>{
   if(timeout.current)clearTimeout(timeout.current);
   timeout.current=null;
   setOpening(false);
 };
 useEffect(()=>{
   routeRef.current=route;
   hide();
 },[route]);
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
     setOpening(true);
     if(timeout.current)clearTimeout(timeout.current);
     // A failed/stalled navigation must never trap the UI in endless loading.
     timeout.current=setTimeout(()=>{setOpening(false);timeout.current=null;},12000);
   }
   function onPop(){hide();}
   document.addEventListener("click",onClick,true);
   window.addEventListener("popstate",onPop);
   return()=>{
     document.removeEventListener("click",onClick,true);
     window.removeEventListener("popstate",onPop);
     if(timeout.current)clearTimeout(timeout.current);
   };
 },[]);
 return <div className={"motion-route-progress"+(opening?" is-opening":"")} role="status" aria-live="polite" aria-atomic="true">
   {opening?<span className="sr-only">Opening the next page</span>:null}
   <span className="motion-route-progress-track" aria-hidden="true"/>
 </div>;
}
export function NavigationProgress(){
 return <Suspense fallback={null}><RouteProgressInner/></Suspense>;
}

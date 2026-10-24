import type { ReactNode } from "react";
import type { CareerId } from "@skillmetry/shared/types/domain";
export const careerMotifNames: Record<CareerId,string>={"frontend-developer":"Browser interface","backend-developer":"API connection","full-stack-developer":"Joined layers","ml-engineer":"Model network","data-analyst":"Dataset chart","data-scientist":"Data trend","ai-llm-application-engineer":"Token flow","devops-engineer":"Delivery pipeline","qa-automation-engineer":"Test stages","cybersecurity-analyst":"Shield and lock","android-developer":"Mobile interface","cloud-engineer":"Cloud infrastructure","data-engineer":"Data pipeline","ui-ux-designer":"Wireframe interface"};

const shapes: Record<CareerId, ReactNode> = {
  "frontend-developer": <><rect x="12" y="11" width="72" height="43" rx="4"/><path d="M12 21h72M24 31h20M24 39h40"/></>,
  "backend-developer": <><rect x="12" y="16" width="25" height="32" rx="3"/><rect x="59" y="16" width="25" height="32" rx="3"/><path d="M37 25h22M37 39h22"/></>,
  "full-stack-developer": <><rect x="13" y="10" width="70" height="15" rx="3"/><rect x="13" y="39" width="70" height="15" rx="3"/><path d="M30 25v14M48 25v14M66 25v14"/></>,
  "ml-engineer": <><circle cx="18" cy="32" r="5"/><circle cx="43" cy="17" r="5"/><circle cx="43" cy="47" r="5"/><circle cx="72" cy="32" r="5"/><path d="m23 30 15-10m0 28-15-12m10-16 24 10m0 5-24 10"/></>,
  "data-analyst": <><path d="M16 15v33M16 48h65M27 42V30M43 42V22M59 42V34M75 42V18"/></>,
  "data-scientist": <><path d="M14 48h68M14 48V14m8 25 14-13 13 8 25-20"/><circle cx="22" cy="39" r="2"/><circle cx="36" cy="26" r="2"/><circle cx="49" cy="34" r="2"/><circle cx="74" cy="14" r="2"/></>,
  "ai-llm-application-engineer": <><rect x="9" y="24" width="15" height="16" rx="3"/><rect x="38" y="16" width="20" height="32" rx="4"/><rect x="72" y="24" width="15" height="16" rx="3"/><path d="M24 32h14m20 0h14M45 24h6m-6 8h6m-6 8h6"/></>,
  "devops-engineer": <><rect x="10" y="26" width="18" height="14" rx="3"/><rect x="39" y="26" width="18" height="14" rx="3"/><rect x="68" y="26" width="18" height="14" rx="3"/><path d="m28 33 11 0m18 0h11"/></>,
  "qa-automation-engineer": <><rect x="12" y="18" width="20" height="28" rx="3"/><rect x="39" y="18" width="20" height="28" rx="3"/><rect x="66" y="18" width="20" height="28" rx="3"/><path d="m18 32 5 5 7-11m27 6 5 5 7-11m-27-7 5 5 7-11"/></>,
  "cybersecurity-analyst": <><path d="M48 8 76 18v16c0 14-12 21-28 25C32 55 20 48 20 34V18Z"/><rect x="38" y="30" width="20" height="16" rx="3"/><path d="M42 30v-5a6 6 0 0 1 12 0v5"/></>,
  "android-developer": <><rect x="31" y="7" width="34" height="50" rx="6"/><path d="M40 16h16M38 25h20v19H38zM45 51h6"/></>,
  "cloud-engineer": <><path d="M25 46h49a12 12 0 0 0 0-24 18 18 0 0 0-34-5 14 14 0 0 0-15 29Z"/><path d="M29 52v-8m19 8v-8m18 8v-8"/></>,
  "data-engineer": <><rect x="10" y="24" width="18" height="16" rx="3"/><rect x="39" y="24" width="18" height="16" rx="3"/><rect x="68" y="24" width="18" height="16" rx="3"/><path d="m28 32 11 0m18 0h11"/></>,
  "ui-ux-designer": <><rect x="10" y="11" width="34" height="42" rx="3"/><rect x="52" y="11" width="34" height="42" rx="3"/><path d="M16 19h22M16 27h12m-12 10h22m20-18h22m-22 8h22m-22 10h22"/></>,
};
export function CareerMotif({ careerId, compact = false, active = false }: { careerId: CareerId; compact?: boolean; active?: boolean }) {
  const accessibility = compact ? { "aria-hidden": true } : { "aria-label": careerMotifNames[careerId], role: "img" };

  return (
    <span className={`career-motif${compact ? " career-motif-compact" : ""}${active ? " career-motif-active" : ""}`} data-career-motif={careerId} {...accessibility}>
      <svg viewBox="0 0 96 64" focusable="false" aria-hidden="true">{shapes[careerId]}</svg>
    </span>
  );
}

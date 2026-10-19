import {describe,it,expect} from "vitest";
import {selectCourseContinuation} from "../shared/lib/learning-continuation";
import {editorialInventoryState,publishedEditorialRevision} from "../shared/lib/editorial-inventory";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const source=(path:string)=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");

const courses=[{slug:"javascript-foundations",skillId:"javascript",title:"JavaScript",version:3,
  modules:[{lessons:[{id:"one",title:"Basic syntax"},{id:"two",title:"Arrays"},{id:"three",title:"Functions"}]}]}];

describe("Five-phase product journey: only published, trustworthy evidence",()=>{
 it("resumes a published course after the first genuinely saved activity",()=>{
   const next=selectCourseContinuation(courses,[{courseSlug:"javascript-foundations",lessonId:"one",
     publishedRevision:3,completed:true}]);
   expect(next).toMatchObject({lessonId:"two",complete:1,total:3,href:"/courses?course=javascript-foundations"});
 });
 it("never turns old course versions into current completion or fabricates scores",()=>{
   expect(selectCourseContinuation(courses,[{courseSlug:"javascript-foundations",lessonId:"one",
     publishedRevision:2,completed:true}])).toBeNull();
   expect(selectCourseContinuation(courses,[])).toBeNull();
   expect(selectCourseContinuation(courses,courses[0].modules[0].lessons.map(l=>({
     courseSlug:courses[0].slug,lessonId:l.id,publishedRevision:3,completed:true
   })))).toBeNull();
 });
 it("does not generate a navigation URL from an invalid published slug",()=>{
   expect(selectCourseContinuation([{...courses[0],slug:"javascript?evil=/logout"}],[{
     courseSlug:"javascript?evil=/logout",lessonId:"one",publishedRevision:3,completed:true
   }])).toBeNull();
 });
 it("counts CMS assessment revisions without numeric coercion bugs",()=>{
   expect(publishedEditorialRevision("assessments",{published_version:"cms.3"})).toBe(3);
   expect(editorialInventoryState("assessments",{revision:3,published_version:"cms.3"}))
     .toEqual({published:true,needsReview:false});
   expect(editorialInventoryState("assessments",{revision:4,published_version:"cms.3"}))
     .toEqual({published:true,needsReview:true});
   expect(editorialInventoryState("assessments",{revision:4,published_version:null}))
     .toEqual({published:false,needsReview:true});
   expect(editorialInventoryState("assessments",{revision:4,published_version:"bad"}).needsReview)
     .toBe(true);
 });
 it("counts numeric-revision guide drafts without using content payloads",()=>{
   expect(editorialInventoryState("guides",{revision:5,published_revision:4,published:{}}))
     .toEqual({published:true,needsReview:true});
   expect(editorialInventoryState("guides",{revision:5,published_revision:5,published:{}}))
     .toEqual({published:true,needsReview:false});
 });
 it("wires resume and skill-specific course/practice/assessment routes",()=>{
   const dash=source("frontend/src/app/(workspace)/dashboard/page.tsx");
   const coursesPage=source("frontend/src/app/(workspace)/courses/page.tsx");
   const lab=source("frontend/src/app/(workspace)/lab/page.tsx");
   expect(dash).toContain("selectCourseContinuation");
   expect(dash).toContain('label: "Resume course"');
   expect(coursesPage).toContain('href={"/lab?skill="+encodeURIComponent(course.skillId)}');
   expect(coursesPage).toContain('new URLSearchParams(window.location.search).get("course")');
   expect(lab).toContain('new URLSearchParams(window.location.search).get("skill")');
 });
 it("keeps rollout gates, editorial RBAC, and feedback collection explicit",()=>{
   const progressApi=source("frontend/src/app/api/learning/course-progress/route.ts");
   expect(progressApi).toContain('process.env.SKILLMETRY_COURSE_PROGRESS_ENABLED==="true"');
   expect(progressApi).toContain("Same-origin update required.");
   const reviewApi=source("frontend/src/app/api/admin/reviews/route.ts");
   expect(reviewApi).toContain('session.role!=="reviewer"');
   expect(reviewApi).toContain("You cannot approve your own request.");
   const feedback=source("frontend/src/app/(workspace)/feedback/page.tsx");
   expect(feedback).toContain("This form sends no analytics or responses");
 });
});

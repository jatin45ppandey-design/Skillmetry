/**
 * Continue with the most recently studied, *currently published* course.
 * Lesson completion is self-reported, not a measured skill score.
 */
export type ResumeCourse={slug:string;skillId:string;title:string;version:number;
 modules:readonly {lessons:readonly {id:string;title:string}[]}[]};
export type SavedLessonActivity={courseSlug:string;lessonId:string;publishedRevision:number;completed:boolean;
 completedAt?:string|null};
export type ContinueLearning={courseSlug:string;skillId:string;courseTitle:string;lessonId:string;lessonTitle:string;
 complete:number;total:number;href:string};
export function selectCourseContinuation(
 courses:readonly ResumeCourse[],
 saved:readonly SavedLessonActivity[]
):ContinueLearning|null{
 const candidates:{data:ContinueLearning;lastActivity:number;order:number}[]=[];
 for(const [order,course] of courses.entries()){
   if(!/^[a-z][a-z0-9-]{3,49}$/.test(course.slug))continue;
   if(!/^[a-z][a-z0-9-]{1,79}$/.test(course.skillId))continue;
   if(!Number.isSafeInteger(course.version)||course.version<1)continue;
   const lessons=course.modules.flatMap(m=>m.lessons);
   if(!lessons.length)continue;
   const completedRows=saved.filter(a=>a.courseSlug===course.slug&&a.publishedRevision===course.version&&a.completed
     &&lessons.some(lesson=>lesson.id===a.lessonId));
   const completed=new Set(completedRows.map(a=>a.lessonId));
   if(!completed.size||completed.size>=lessons.length)continue;
   const next=lessons.find(lesson=>!completed.has(lesson.id));
   if(!next)continue;
   const lastActivity=completedRows.reduce((latest,row)=>{
     const time=row.completedAt?Date.parse(row.completedAt):Number.NaN;
     return Number.isFinite(time)?Math.max(latest,time):latest;
   },0);
   candidates.push({order,lastActivity,data:{
     courseSlug:course.slug,skillId:course.skillId,courseTitle:course.title,
     lessonId:next.id,lessonTitle:next.title,complete:completed.size,total:lessons.length,
     href:"/courses?course="+encodeURIComponent(course.slug)
   }});
 }
 candidates.sort((a,b)=>b.lastActivity-a.lastActivity||a.order-b.order);
 return candidates[0]?.data??null;
}

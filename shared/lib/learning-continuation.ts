/**
 * A safe resume hint from published lessons and self-reported activity.
 * Never estimates scores or reads sample assessment results.
 */
export type ResumeCourse={slug:string;skillId:string;title:string;version:number;
 modules:readonly {lessons:readonly {id:string;title:string}[]}[]};
export type SavedLessonActivity={courseSlug:string;lessonId:string;publishedRevision:number;completed:boolean};
export type ContinueLearning={courseSlug:string;skillId:string;courseTitle:string;lessonId:string;lessonTitle:string;
 complete:number;total:number;href:string};
export function selectCourseContinuation(
 courses:readonly ResumeCourse[],
 saved:readonly SavedLessonActivity[]
):ContinueLearning|null{
 for(const course of courses){
   if(!/^[a-z][a-z0-9-]{3,49}$/.test(course.slug))continue;
   if(!/^[a-z][a-z0-9-]{1,79}$/.test(course.skillId))continue;
   if(!Number.isSafeInteger(course.version)||course.version<1)continue;
   const lessons=course.modules.flatMap(m=>m.lessons);
   if(!lessons.length)continue;
   const completed=new Set(saved.filter(a=>a.courseSlug===course.slug&&a.publishedRevision===course.version&&a.completed)
     .map(a=>a.lessonId));
   if(!completed.size||completed.size>=lessons.length)continue;
   const next=lessons.find(lesson=>!completed.has(lesson.id));
   if(!next)continue;
   return {courseSlug:course.slug,skillId:course.skillId,courseTitle:course.title,
     lessonId:next.id,lessonTitle:next.title,complete:completed.size,total:lessons.length,
     href:"/courses?course="+encodeURIComponent(course.slug)};
 }
 return null;
}

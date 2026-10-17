/** Private editorial metadata only; never derive workflow status from draft body or answer keys. */
export type EditorialSection="guides"|"roadmaps"|"courses"|"missions"|"assessments";
type Metadata={revision?:unknown;published_revision?:unknown;published_version?:unknown;published?:unknown};
export function publishedEditorialRevision(module:EditorialSection,row:Metadata):number{
 if(module==="assessments"){
   // Bank version is the immutable string "cms.N", not a numeric published_revision field.
   const match=typeof row.published_version==="string"?/^cms\.([1-9][0-9]{0,7})$/.exec(row.published_version):null;
   return match?Number(match[1]):0;
 }
 const n=row.published_revision;
 return typeof n==="number"&&Number.isSafeInteger(n)&&n>0?n:0;
}
export function editorialInventoryState(module:EditorialSection,row:Metadata){
 const isPublished=module==="assessments"?Boolean(row.published_version):row.published!==null&&row.published!==undefined;
 const revision=typeof row.revision==="number"&&Number.isSafeInteger(row.revision)&&row.revision>0?row.revision:0;
 const publishedRevision=publishedEditorialRevision(module,row);
 return {published:isPublished,needsReview:!isPublished||revision>publishedRevision};
}

import Link from "next/link";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {AdminStudioWorkspace} from "@/components/admin-studio-workspace";
export const dynamic="force-dynamic";
export default async function AdminStudio(){
 const session=await adminSession();
 if(session.status==="ready")return <main className="admin-studio-shell">
   <header className="admin-studio-top"><div><span className="admin-eyebrow">SKILLMETRY / ADMIN STUDIO</span>
     <h1>Content Studio</h1><p>Choose a workspace to edit drafts, review changes and publish approved learning material.</p></div>
     <div className="sx-admin-top-actions"><span className="sx-admin-role">{session.role.toUpperCase()} ACCESS</span><Link href="/dashboard" className="btn btn-outline">Student workspace ↗</Link></div>
   </header><AdminStudioWorkspace role={session.role}/></main>;
 return <main className="admin-studio-shell">
   <section className="admin-gate"><span className="admin-eyebrow">SKILLMETRY / RESTRICTED</span>
     <h1>Content Studio is not available.</h1>
     <p>{session.status==="unavailable"?"This feature is staged until its secure database migration and configuration are approved.":
       session.status==="unauthorized"?"Sign in with your permitted admin account to continue.":
       "Your account has no editorial access. Ask the owner to grant a role."}</p>
     <Link className="btn btn-primary" href={session.status==="unauthorized"?"/auth/sign-in?next=/admin":"/dashboard"}>
       {session.status==="unauthorized"?"Sign in":"Back to learning"}</Link>
   </section>
 </main>;
}

import type {MetadataRoute} from "next";

export default function robots():MetadataRoute.Robots {
 return {rules:[{userAgent:"*",allow:"/",disallow:[
   "/api/","/account","/auth/","/passport/share/","/dashboard","/settings",
   "/twin","/planner","/missions","/lab","/jobs","/tutor"
 ]}]};
}

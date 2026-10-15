import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({status:"ok",name:"skillmetry",mode:"local-prototype",version:"0.1.0"})}

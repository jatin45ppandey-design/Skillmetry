import { NextResponse } from "next/server";
// Deliberate placeholder. Never expose provider API keys in client code.
export async function POST(){return NextResponse.json({error:"AI mission generation is not implemented in this starter.",feature:"P1"},{status:501});}

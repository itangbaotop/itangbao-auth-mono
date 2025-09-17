import { getUserId } from "@/app/lib/server-utils";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
    const userId = await getUserId(req);
    console.log(userId);
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }
  return new Response('Hello, world!');
}

export async function POST(req: Request) {
  return new Response('Hello, world!');
}
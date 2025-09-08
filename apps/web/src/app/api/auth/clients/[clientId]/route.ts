import { getDb } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {

        const { env } = await getCloudflareContext();
        const db = getDb(env.DB);
        const application = await db.select()
            .from(applications)
            .where(eq(applications.clientId, params.clientId));
            
        if (!application[0]) {
            return NextResponse.json(
                { error: "应用不存在" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            id: application[0].id,
            name: application[0].name,
            description: application[0].description,
            clientId: application[0].clientId,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "获取应用失败" },
            { status: 500 }
        );
    }
}
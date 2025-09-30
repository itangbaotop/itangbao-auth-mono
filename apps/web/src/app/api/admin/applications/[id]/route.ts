// src/app/api/admin/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { getDb } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { clearApplicationDomainsCache } from "@/lib/cors/application-cors";

// 更新应用
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    
    const body = await request.json() as {
      name: string;
      description: string;
      domain: string;
      redirectUris: string[];
      isActive: boolean;
    };
    const { name, description, domain, redirectUris, isActive } = body;
    
    const updatedApp = await db.update(applications)
      .set({
        name,
        description,
        domain,
        redirectUris: JSON.stringify(redirectUris),
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();
    
    if (!updatedApp[0]) {
      return NextResponse.json(
        { error: "应用不存在" },
        { status: 404 }
      );
    }
    
     clearApplicationDomainsCache();
    return NextResponse.json(updatedApp[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新应用失败" },
      { status: 500 }
    );
  }
}

// 删除应用
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    
    await db.delete(applications)
      .where(eq(applications.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除应用失败" },
      { status: 500 }
    );
  }
}

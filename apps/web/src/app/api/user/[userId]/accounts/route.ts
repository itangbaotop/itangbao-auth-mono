// src/app/api/user/[userId]/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { auth } from '@/lib/auth/config';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    // 验证用户权限
    const session = await auth();
    
    const params = await props.params;
    const { userId } = params;

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = getCloudflareContext();
    const db = getDb(context.env.DB);
    
    const userAccounts = await db.select({
      provider: accounts.provider,
      type: accounts.type,
      providerAccountId: accounts.providerAccountId,
    }).from(accounts).where(eq(accounts.userId, userId));
    
    return NextResponse.json(userAccounts);
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

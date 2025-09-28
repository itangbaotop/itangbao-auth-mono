import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/server-utils';

export async function GET(request: NextRequest) {
  // Use the standard utility to protect the route.
  const user = await getUserFromRequest(request);

  // If getUserFromRequest returns null (due to an invalid/expired token),
  // return a 401. This is the trigger for our frontend's refresh logic.
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If the token is valid, return some mock business data.
  // This is the data we expect to see after a successful token refresh and retry.
  return NextResponse.json({
    data: {
      projectId: 'project-123',
      businessName: 'Confidential Business Data',
      reportDate: new Date().toISOString(),
      accessedBy: user.name,
    },
  });
}
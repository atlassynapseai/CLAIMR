import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_COUNTIES } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.SURPLUS_CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Missing SURPLUS_CRON_SECRET' }, { status: 500 });
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const results = await Promise.all(
    DEFAULT_COUNTIES.map(async (county) => {
      const response = await fetch(`${appUrl}/api/surplus/scrape`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(county),
      });
      return {
        county: county.county_name,
        status: response.status,
        data: await response.json(),
      };
    })
  );

  return NextResponse.json({ ran_at: new Date().toISOString(), results });
}

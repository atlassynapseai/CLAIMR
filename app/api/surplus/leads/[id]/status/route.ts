export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { LEAD_STATUSES } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = (await request.json()) as { status?: string };
  if (!payload.status || !LEAD_STATUSES.includes(payload.status as (typeof LEAD_STATUSES)[number])) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('surplus_leads')
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ lead: data });
}

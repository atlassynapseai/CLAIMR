export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function escapeCsvCell(value: unknown): string {
  const normalized = String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const safe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  const { data, error } = await getSupabaseAdmin().from('surplus_leads').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const headers = ['owner', 'property_address', 'county_name', 'state', 'gross_surplus', 'risk_score', 'status', 'created_at'];
  const rows = (data ?? []).map((lead) =>
    [
      lead.original_owner,
      lead.property_address,
      lead.county_name,
      lead.state,
      lead.gross_surplus,
      lead.risk_score,
      lead.status,
      lead.created_at,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="claimr-leads.csv"',
    },
  });
}

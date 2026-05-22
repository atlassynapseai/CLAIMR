export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const statuses = ['RAW_LEAD', 'DEAD_LEAD', 'CLEARED_LEAD', 'READY_FOR_OUTREACH', 'CONTACTED', 'CLOSED'] as const;
const riskScores = ['CLEAN', 'RISK', 'DEAD'] as const;

function makeLead(index: number) {
  const florida = index % 2 === 0;
  const case_number = florida
    ? `2026-CA-${String(100001 + index).padStart(6, '0')}`
    : `2026-${String(200001 + index).padStart(6, '0')}`;
  const opening = 100000 + index * 8000;
  const final = opening + 26000 + index * 2500;

  return {
    county_id: florida ? 'miami-dade-fl' : 'harris-tx',
    county_name: florida ? 'Miami-Dade County' : 'Harris County',
    state: florida ? 'FL' : 'TX',
    case_number,
    original_owner: `${florida ? 'Florida' : 'Texas'} Owner ${index + 1}`,
    property_address: `${1500 + index} ${florida ? 'Biscayne' : 'Main'} Ave, ${florida ? 'Miami' : 'Houston'}, ${florida ? 'FL' : 'TX'}`,
    opening_bid: opening,
    final_sale_price: final,
    gross_surplus: final - opening,
    net_surplus: final - opening - 5000,
    status: statuses[index % statuses.length],
    risk_score: riskScores[index % riskScores.length],
    risk_reason: 'Seeded mock scenario',
    lien_data:
      riskScores[index % riskScores.length] === 'CLEAN'
        ? { has_liens: false, lien_types: [], estimated_lien_amount: 0, risk_level: 'CLEAN', explanation: 'No liens found' }
        : { has_liens: true, lien_types: ['Tax Lien'], estimated_lien_amount: 7000 + index * 300, risk_level: riskScores[index % riskScores.length], explanation: 'Mock lien detected' },
    contact_data: {
      phones: [`+1-555-010-${String(1000 + index).slice(-4)}`],
      emails: [`owner${index + 1}@example.com`],
      current_address: `${2500 + index} Updated Residence Rd`,
      confidence_score: 70 + (index % 20),
    },
  };
}

export async function POST() {
  try {
    const seed = Array.from({ length: 15 }).map((_, index) => makeLead(index));

    const { data, error } = await getSupabaseAdmin().from('surplus_leads').upsert(seed, { onConflict: 'case_number' }).select('*');
    if (error) throw new Error(error.message);

    return NextResponse.json({ inserted: data?.length ?? 0, leads: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { MINIMUM_SURPLUS } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type LienEvaluation = {
  has_liens: boolean;
  lien_types: string[];
  estimated_lien_amount: number;
  risk_level: 'CLEAN' | 'RISK' | 'DEAD';
  explanation: string;
};

async function evaluateWithAnthropic(address: string, state: string): Promise<LienEvaluation> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not configured');

  const anthropic = new Anthropic({ apiKey: key });
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are a real estate title risk evaluator. Given this property address: ${address} in ${state}, simulate a realistic lien check. Return only valid JSON with no markdown: {has_liens: boolean, lien_types: array of strings, estimated_lien_amount: number, risk_level: string (CLEAN or RISK or DEAD), explanation: string}`,
      },
    ],
  });

  const content = response.content.find((entry) => entry.type === 'text');
  if (!content || content.type !== 'text') throw new Error('Invalid Claude response');
  return JSON.parse(content.text) as LienEvaluation;
}

async function evaluateWithAttom(address: string): Promise<LienEvaluation | null> {
  const key = process.env.ATTOM_API_KEY;
  if (!key) return null;

  const response = await fetch(`https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1=${encodeURIComponent(address)}`, {
    headers: {
      apikey: key,
      accept: 'application/json',
    },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    property?: Array<{ assessment?: { appraised?: { total?: number } } }>;
  };
  const estimated = Number(payload.property?.[0]?.assessment?.appraised?.total ?? 0);

  return {
    has_liens: estimated > 0,
    lien_types: estimated > 0 ? ['Tax Assessment Risk'] : [],
    estimated_lien_amount: estimated,
    risk_level: estimated > 0 ? 'RISK' : 'CLEAN',
    explanation: estimated > 0 ? 'Estimated from ATTOM appraised tax risk data.' : 'No risk flags returned from ATTOM endpoint.',
  };
}

export async function POST() {
  try {
    const { data: leads, error } = await getSupabaseAdmin()
      .from('surplus_leads')
      .select('*')
      .eq('status', 'RAW_LEAD')
      .gte('gross_surplus', MINIMUM_SURPLUS);

    if (error) throw new Error(error.message);

    const results = [] as Record<string, unknown>[];

    for (const lead of leads ?? []) {
      const attomResult = await evaluateWithAttom(lead.property_address);
      const evaluation = attomResult ?? (await evaluateWithAnthropic(lead.property_address, lead.state || 'Unknown'));

      const lienTotal = Number(evaluation.estimated_lien_amount || 0);
      const gross = Number(lead.gross_surplus || 0);

      let status = 'CLEARED_LEAD';
      let riskScore: 'CLEAN' | 'RISK' | 'DEAD' = evaluation.has_liens ? 'RISK' : 'CLEAN';

      if (lienTotal > gross) {
        status = 'DEAD_LEAD';
        riskScore = 'DEAD';
      }

      const { data: updated, error: updateError } = await getSupabaseAdmin()
        .from('surplus_leads')
        .update({
          status,
          risk_score: riskScore,
          risk_reason: evaluation.explanation,
          lien_data: evaluation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
        .select('*')
        .single();

      if (updateError) throw new Error(updateError.message);
      results.push(updated);
    }

    return NextResponse.json({ processed: results.length, leads: results });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

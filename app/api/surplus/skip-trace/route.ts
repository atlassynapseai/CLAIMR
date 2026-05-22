export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type ContactData = {
  phones: string[];
  emails: string[];
  current_address: string;
  confidence_score: number;
};

async function getMockContact(ownerName: string, address: string): Promise<ContactData> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return {
      phones: ['+1-555-010-7788'],
      emails: [`${ownerName.toLowerCase().replace(/\s+/g, '.')}@examplemail.com`],
      current_address: address,
      confidence_score: 62,
    };
  }

  const anthropic = new Anthropic({ apiKey: key });
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 250,
    messages: [
      {
        role: 'user',
        content: `Generate realistic mock contact data for a property owner named ${ownerName} who previously lived at ${address}. Return only valid JSON with no markdown: {phones: array of strings, emails: array of strings, current_address: string, confidence_score: number between 0 and 100}`,
      },
    ],
  });

  const content = response.content.find((entry) => entry.type === 'text');
  if (!content || content.type !== 'text') throw new Error('Invalid Claude response');
  return JSON.parse(content.text) as ContactData;
}

async function getSkipifyContact(ownerName: string, address: string): Promise<ContactData | null> {
  const key = process.env.SKIPIFY_API_KEY;
  if (!key) return null;

  const response = await fetch('https://api.skipify.com/v1/lookup', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: ownerName, address }),
  });

  if (!response.ok) return null;

  const json = (await response.json()) as ContactData;
  return json;
}

export async function POST() {
  try {
    const { data: leads, error } = await getSupabaseAdmin().from('surplus_leads').select('*').eq('status', 'CLEARED_LEAD');
    if (error) throw new Error(error.message);

    const updated = [] as Record<string, unknown>[];

    for (const lead of leads ?? []) {
      const contactData =
        (await getSkipifyContact(lead.original_owner, lead.property_address)) ||
        (await getMockContact(lead.original_owner, lead.property_address));

      const { data, error: updateError } = await getSupabaseAdmin()
        .from('surplus_leads')
        .update({
          contact_data: contactData,
          status: 'READY_FOR_OUTREACH',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
        .select('*')
        .single();

      if (updateError) throw new Error(updateError.message);
      updated.push(data);
    }

    return NextResponse.json({ processed: updated.length, leads: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

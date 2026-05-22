import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { MINIMUM_SURPLUS } from '@/lib/constants';
import { parseHtmlAuctionResults, parsePdfAuctionText } from '@/lib/parsers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ScrapePayload = {
  county_url: string;
  county_id: string;
  county_name: string;
  state: string;
  format: 'pdf' | 'html';
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ScrapePayload;

    if (!payload.county_url || !payload.county_id || !payload.county_name || !payload.state || !payload.format) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const response = await fetch(payload.county_url, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch county data: ${response.status}` }, { status: 400 });
    }

    const parsedLeads =
      payload.format === 'html'
        ? parseHtmlAuctionResults(await response.text())
        : await (async () => {
            const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
            const text = await parser.getText();
            await parser.destroy();
            return parsePdfAuctionText(text.text);
          })();

    let inserted = 0;
    let skipped = 0;
    const leads = [] as Record<string, unknown>[];

    for (const lead of parsedLeads) {
      const gross_surplus = lead.final_sale_price - lead.opening_bid;
      if (gross_surplus < MINIMUM_SURPLUS) {
        skipped += 1;
        continue;
      }

      const row = {
        county_id: payload.county_id,
        county_name: payload.county_name,
        state: payload.state,
        case_number: lead.case_number,
        original_owner: lead.original_owner,
        property_address: lead.property_address,
        opening_bid: lead.opening_bid,
        final_sale_price: lead.final_sale_price,
        gross_surplus,
        status: 'RAW_LEAD',
      };

      const { data, error } = await getSupabaseAdmin()
        .from('surplus_leads')
        .upsert(row, { onConflict: 'case_number', ignoreDuplicates: true })
        .select()
        .maybeSingle();

      if (error) {
        skipped += 1;
        continue;
      }

      if (data) {
        inserted += 1;
        leads.push(data);
      } else {
        skipped += 1;
      }
    }

    return NextResponse.json({ inserted, skipped, leads });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

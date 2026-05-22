import * as cheerio from 'cheerio';
import { parseMoney } from '@/lib/utils';

export type ParsedLead = {
  case_number: string;
  original_owner: string;
  property_address: string;
  opening_bid: number;
  final_sale_price: number;
};

const htmlMapping = (cells: string[]): ParsedLead | null => {
  if (cells.length < 5) return null;
  const [case_number, original_owner, property_address, opening_bid, final_sale_price] = cells;
  if (!case_number || !original_owner || !property_address) return null;

  return {
    case_number,
    original_owner,
    property_address,
    opening_bid: parseMoney(opening_bid),
    final_sale_price: parseMoney(final_sale_price),
  };
};

export function parseHtmlAuctionResults(html: string): ParsedLead[] {
  const $ = cheerio.load(html);
  return $('table tr')
    .map((_, row) => {
      const cells = $(row)
        .find('td')
        .map((__, td) => $(td).text().trim())
        .get();
      return htmlMapping(cells);
    })
    .get()
    .filter((lead): lead is ParsedLead => Boolean(lead));
}

export function parsePdfAuctionText(text: string): ParsedLead[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const leads: ParsedLead[] = [];
  const regex = /(\d{4}(?:-CA)?-\d{6})\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*\$?([\d,]+(?:\.\d{1,2})?)\s*\|\s*\$?([\d,]+(?:\.\d{1,2})?)/;

  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;

    const [, case_number, original_owner, property_address, opening_bid, final_sale_price] = match;
    leads.push({
      case_number: case_number.trim(),
      original_owner: original_owner.trim(),
      property_address: property_address.trim(),
      opening_bid: parseMoney(opening_bid),
      final_sale_price: parseMoney(final_sale_price),
    });
  }

  return leads;
}

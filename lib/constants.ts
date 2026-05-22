export const LEAD_STATUSES = [
  'RAW_LEAD',
  'DEAD_LEAD',
  'CLEARED_LEAD',
  'READY_FOR_OUTREACH',
  'CONTACTED',
  'CLOSED',
] as const;

export const RISK_SCORES = ['CLEAN', 'RISK', 'DEAD'] as const;

export const MINIMUM_SURPLUS = 20000;

export const DEFAULT_COUNTIES = [
  {
    county_id: 'miami-dade-fl',
    county_name: 'Miami-Dade County',
    state: 'FL',
    county_url: 'https://example.com/miami-dade-auctions',
    format: 'html' as const,
  },
  {
    county_id: 'harris-tx',
    county_name: 'Harris County',
    state: 'TX',
    county_url: 'https://example.com/harris-auctions.pdf',
    format: 'pdf' as const,
  },
];

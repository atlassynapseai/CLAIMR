import { LEAD_STATUSES, RISK_SCORES } from '@/lib/constants';

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type RiskScore = (typeof RISK_SCORES)[number];

export type SurplusLead = {
  id: string;
  county_id: string;
  case_number: string;
  original_owner: string;
  property_address: string;
  opening_bid: number;
  final_sale_price: number;
  gross_surplus: number;
  net_surplus: number | null;
  status: LeadStatus;
  lien_data: Record<string, unknown> | null;
  contact_data: Record<string, unknown> | null;
  risk_score: RiskScore | null;
  risk_reason: string | null;
  county_name: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactData = {
  phones: string[];
  emails: string[];
  current_address: string;
  confidence_score: number;
};

export type LienData = {
  has_liens: boolean;
  lien_types: string[];
  estimated_lien_amount: number;
  risk_level: RiskScore;
  explanation: string;
};

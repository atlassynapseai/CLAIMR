import { LEAD_STATUSES } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function getLeads() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('surplus_leads').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeadById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('surplus_leads').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDashboardMetrics() {
  const leads = await getLeads();
  const counters = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<(typeof LEAD_STATUSES)[number], number>;

  let totalSurplus = 0;
  for (const lead of leads) {
    counters[lead.status as keyof typeof counters] += 1;
    totalSurplus += Number(lead.gross_surplus || 0);
  }

  return {
    total: leads.length,
    raw: counters.RAW_LEAD,
    cleared: counters.CLEARED_LEAD,
    dead: counters.DEAD_LEAD,
    ready: counters.READY_FOR_OUTREACH,
    totalSurplus,
    leads,
  };
}

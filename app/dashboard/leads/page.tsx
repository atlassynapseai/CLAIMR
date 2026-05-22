import Link from 'next/link';
import { format } from 'date-fns';
import { getLeads } from '@/lib/data';
import { badgeColor, currency } from '@/lib/utils';

type Params = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LeadsPage({ searchParams }: Params) {
  const page = Number(searchParams?.page ?? 1);
  const query = String(searchParams?.q ?? '');
  const status = String(searchParams?.status ?? 'ALL');
  const risk = String(searchParams?.risk ?? 'ALL');
  const state = String(searchParams?.state ?? 'ALL');
  const leads = await getLeads();

  const filtered = leads.filter((lead) => {
    const matchesSearch = query
      ? `${lead.original_owner} ${lead.property_address}`.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesStatus = status === 'ALL' ? true : lead.status === status;
    const matchesRisk = risk === 'ALL' ? true : lead.risk_score === risk;
    const matchesState = state === 'ALL' ? true : lead.state === state;
    return matchesSearch && matchesStatus && matchesRisk && matchesState;
  });

  const pageSize = 10;
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">All Leads</h1>
        <a className="btn-muted" href="/api/surplus/export">
          Export to CSV
        </a>
      </div>

      <form className="card grid gap-3 p-4 md:grid-cols-5">
        <input className="input" name="q" defaultValue={query} placeholder="Search owner or address" />
        <select className="input" name="status" defaultValue={status}>
          <option value="ALL">All Statuses</option>
          {['RAW_LEAD', 'DEAD_LEAD', 'CLEARED_LEAD', 'READY_FOR_OUTREACH', 'CONTACTED', 'CLOSED'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select className="input" name="risk" defaultValue={risk}>
          <option value="ALL">All Risk</option>
          {['CLEAN', 'RISK', 'DEAD'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select className="input" name="state" defaultValue={state}>
          <option value="ALL">All States</option>
          {['FL', 'TX'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button className="btn-primary">Apply Filters</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[#1e1e2e] text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Property Address</th>
              <th className="px-4 py-3">County</th>
              <th className="px-4 py-3">Surplus Amount</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={8}>
                  No leads found for these filters.
                </td>
              </tr>
            ) : (
              rows.map((lead) => (
                <tr key={lead.id} className="border-b border-[#1e1e2e]/60">
                  <td className="px-4 py-3">{lead.original_owner}</td>
                  <td className="px-4 py-3">{lead.property_address}</td>
                  <td className="px-4 py-3">{lead.county_name}</td>
                  <td className="px-4 py-3">{currency(Number(lead.gross_surplus || 0))}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-1 text-xs ${badgeColor(lead.risk_score)}`}>{lead.risk_score || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[#2a2a3f] px-2 py-1 text-xs">{lead.status}</span>
                  </td>
                  <td className="px-4 py-3">{format(new Date(lead.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <Link className="text-violet-300 hover:underline" href={`/dashboard/leads/${lead.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <p>
          {totalPages === 0 ? 'No results' : `Page ${safePage} of ${totalPages}`}
        </p>
        <div className="space-x-2">
          <Link className="btn-muted" href={`?q=${encodeURIComponent(query)}&status=${status}&risk=${risk}&state=${state}&page=${Math.max(1, safePage - 1)}`}>
            Previous
          </Link>
          <Link className="btn-muted" href={`?q=${encodeURIComponent(query)}&status=${status}&risk=${risk}&state=${state}&page=${totalPages === 0 ? 1 : Math.min(totalPages, safePage + 1)}`}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

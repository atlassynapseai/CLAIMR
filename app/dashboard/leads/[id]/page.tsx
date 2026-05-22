import { format } from 'date-fns';
import { CopyField, LeadActions } from '@/components/lead-actions';
import { getLeadById } from '@/lib/data';
import { currency } from '@/lib/utils';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadById(params.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lead Detail</h1>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Property Information</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-zinc-400">Owner</dt><dd>{lead.original_owner}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-zinc-400">Case Number</dt><dd>{lead.case_number}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-zinc-400">Address</dt><dd className="text-right">{lead.property_address}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-zinc-400">County/State</dt><dd>{lead.county_name}, {lead.state}</dd></div>
          </dl>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Surplus Breakdown</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-400">Opening Bid</dt><dd>{currency(Number(lead.opening_bid || 0))}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-400">Final Sale Price</dt><dd>{currency(Number(lead.final_sale_price || 0))}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-400">Gross Surplus</dt><dd>{currency(Number(lead.gross_surplus || 0))}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-400">Net Surplus</dt><dd>{currency(Number(lead.net_surplus || 0))}</dd></div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Lien Data</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-[#0d0d14] p-3 text-xs text-zinc-300">
            {JSON.stringify(lead.lien_data || { message: 'No lien data available yet.' }, null, 2)}
          </pre>
        </div>

        <div className="card space-y-4 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Contact Information</h2>
          {lead.contact_data ? (
            <div className="space-y-2">
              {((lead.contact_data as { phones?: string[] }).phones || []).map((phone) => (
                <CopyField key={phone} value={phone} label={phone} />
              ))}
              {((lead.contact_data as { emails?: string[] }).emails || []).map((email) => (
                <CopyField key={email} value={email} label={email} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No contact data available yet.</p>
          )}

          <LeadActions leadId={lead.id} initialStatus={lead.status} />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Activity Timeline</h2>
        <ol className="mt-3 space-y-2 text-sm text-zinc-300">
          <li>Lead created on {format(new Date(lead.created_at), 'PPP p')}</li>
          <li>Current status: {lead.status}</li>
          <li>Last updated on {format(new Date(lead.updated_at), 'PPP p')}</li>
        </ol>
      </section>
    </div>
  );
}

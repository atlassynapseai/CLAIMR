'use client';

import { useMemo, useState } from 'react';
import { currency } from '@/lib/utils';

const statuses = ['RAW_LEAD', 'CLEARED_LEAD', 'READY_FOR_OUTREACH', 'CONTACTED', 'CLOSED', 'DEAD_LEAD'];

type Lead = {
  id: string;
  original_owner: string;
  gross_surplus: number;
  status: string;
};

export function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  const grouped = useMemo(() => {
    const map = new Map<string, Lead[]>();
    statuses.forEach((status) => map.set(status, []));
    leads.forEach((lead) => {
      map.get(lead.status)?.push(lead);
    });
    return map;
  }, [leads]);

  const onDrop = async (leadId: string, nextStatus: string) => {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead)));
    await fetch(`/api/surplus/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {statuses.map((status) => {
        const items = grouped.get(status) || [];
        const total = items.reduce((sum, lead) => sum + Number(lead.gross_surplus || 0), 0);

        return (
          <div
            key={status}
            className="card min-h-40 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const leadId = event.dataTransfer.getData('text/plain');
              if (leadId) onDrop(leadId, status);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{status}</h3>
              <span className="text-xs text-zinc-500">{items.length} • {currency(total)}</span>
            </div>
            <div className="space-y-2">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', lead.id)}
                  className="rounded-lg border border-[#2a2a3f] bg-[#151524] p-2 text-sm"
                >
                  <p className="font-medium">{lead.original_owner}</p>
                  <p className="text-xs text-zinc-400">{currency(Number(lead.gross_surplus || 0))}</p>
                </div>
              ))}
              {items.length === 0 ? <p className="text-xs text-zinc-500">No leads in this column.</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { LEAD_STATUSES } from '@/lib/constants';

export function LeadActions({ leadId, initialStatus }: { leadId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async (next: string) => {
    setStatus(next);
    setSaving(true);
    const response = await fetch(`/api/surplus/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });

    const data = await response.json();
    setSaving(false);
    setMessage(response.ok ? 'Status updated.' : data.error || 'Failed to update status.');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm">Status</label>
      <select className="input" value={status} onChange={(event) => updateStatus(event.target.value)}>
        {LEAD_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <p className="text-xs text-zinc-400">{saving ? 'Saving...' : message}</p>
    </div>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setDone(true);
    setTimeout(() => setDone(false), 900);
  };

  return (
    <button className="btn-muted w-full justify-between" onClick={onCopy} type="button">
      <span>{label}</span>
      <span className="text-xs text-zinc-400">{done ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

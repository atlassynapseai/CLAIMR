'use client';

import { useState } from 'react';

type QuickAction = {
  label: string;
  endpoint: string;
  payload?: Record<string, unknown>;
};

const actions: QuickAction[] = [
  { label: 'Run Scraper', endpoint: '/api/surplus/scrape', payload: { county_url: 'https://example.com/miami-dade-auctions', county_id: 'miami-dade-fl', county_name: 'Miami-Dade County', state: 'FL', format: 'html' } },
  { label: 'Evaluate Risk', endpoint: '/api/surplus/evaluate-risk' },
  { label: 'Skip Trace All', endpoint: '/api/surplus/skip-trace' },
  { label: 'Seed Demo Data', endpoint: '/api/surplus/seed-mock' },
];

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (action: QuickAction) => {
    setLoading(action.label);
    setMessage(null);

    const response = await fetch(action.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(action.payload || {}),
    });

    const data = await response.json();
    setMessage(`${action.label}: ${response.ok ? 'success' : 'failed'} (${data.error || data.processed || data.inserted || response.status})`);
    setLoading(null);
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-zinc-200">Quick Actions</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <button key={action.label} className="btn-muted" disabled={loading !== null} onClick={() => run(action)}>
            {loading === action.label ? 'Running...' : action.label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-xs text-zinc-400">{message}</p> : null}
    </div>
  );
}

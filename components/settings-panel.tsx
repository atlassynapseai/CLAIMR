'use client';

import { useEffect, useState } from 'react';

const countiesDefaults = [
  { id: 'miami-dade-fl', label: 'Miami-Dade County, FL' },
  { id: 'harris-tx', label: 'Harris County, TX' },
];

export function SettingsPanel({ statuses }: { statuses: Record<string, boolean> }) {
  const [threshold, setThreshold] = useState(20000);
  const [cronSchedule, setCronSchedule] = useState('0 9 * * *');
  const [county, setCounty] = useState('');
  const [counties, setCounties] = useState(countiesDefaults);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem('claimr-settings');
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as { threshold?: number; cronSchedule?: string; counties?: { id: string; label: string }[] };
      if (typeof saved.threshold === 'number') setThreshold(saved.threshold);
      if (typeof saved.cronSchedule === 'string') setCronSchedule(saved.cronSchedule);
      if (Array.isArray(saved.counties) && saved.counties.length > 0) setCounties(saved.counties);
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem('claimr-settings', JSON.stringify({ threshold, cronSchedule, counties }));
  }, [threshold, cronSchedule, counties]);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-sm font-semibold">API Key Status</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {Object.entries(statuses).map(([name, configured]) => (
            <li key={name} className="flex items-center justify-between rounded border border-[#1e1e2e] px-3 py-2">
              <span>{name}</span>
              <span className={configured ? 'text-emerald-400' : 'text-zinc-500'}>{configured ? 'Connected' : 'Not configured'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold">Cron Schedule Configuration</h2>
        <input className="input" value={cronSchedule} onChange={(event) => setCronSchedule(event.target.value)} />
        <p className="text-xs text-zinc-500">This value is local reference only. Update `vercel.json` to change deployed cron schedule.</p>
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold">Minimum Surplus Threshold</h2>
        <input className="input" type="number" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold">County Management</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="Add county label" value={county} onChange={(event) => setCounty(event.target.value)} />
          <button
            className="btn-primary"
            onClick={() => {
              if (!county.trim()) return;
              const nextId = county.toLowerCase().replace(/\s+/g, '-');
              if (counties.some((item) => item.id === nextId)) {
                setError('County already exists.');
                return;
              }

              setCounties((current) => [...current, { id: nextId, label: county }]);
              setCounty('');
              setError(null);
            }}
            type="button"
          >
            Add
          </button>
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <ul className="space-y-2 text-sm">
          {counties.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded border border-[#1e1e2e] px-3 py-2">
              <span>{item.label}</span>
              <button className="text-red-400" onClick={() => setCounties((current) => current.filter((county) => county.id !== item.id))} type="button">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

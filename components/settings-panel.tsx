'use client';

import { useState } from 'react';

const countiesDefaults = [
  { id: 'miami-dade-fl', label: 'Miami-Dade County, FL' },
  { id: 'harris-tx', label: 'Harris County, TX' },
];

export function SettingsPanel({ statuses }: { statuses: Record<string, boolean> }) {
  const [threshold, setThreshold] = useState(20000);
  const [cronSchedule, setCronSchedule] = useState('0 9 * * *');
  const [county, setCounty] = useState('');
  const [counties, setCounties] = useState(countiesDefaults);

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
              setCounties((current) => [...current, { id: county.toLowerCase().replace(/\s+/g, '-'), label: county }]);
              setCounty('');
            }}
            type="button"
          >
            Add
          </button>
        </div>
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

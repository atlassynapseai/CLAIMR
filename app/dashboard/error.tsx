'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
      <button className="btn-primary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}

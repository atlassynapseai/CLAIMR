import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getDashboardMetrics } from '@/lib/data';
import { currency } from '@/lib/utils';
import { QuickActions } from '@/components/quick-actions';

function percentage(amount: number, total: number) {
  if (!total) return 0;
  return (amount / total) * 100;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();
  const recent = metrics.leads.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CLAIMR Overview</h1>
        <p className="text-sm text-zinc-400">Multi-agent real estate surplus recovery pipeline.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Leads" value={String(metrics.total)} />
        <StatCard label="Raw Leads" value={String(metrics.raw)} />
        <StatCard label="Cleared Leads" value={String(metrics.cleared)} />
        <StatCard label="Dead Leads" value={String(metrics.dead)} />
        <StatCard label="Ready for Outreach" value={String(metrics.ready)} />
        <StatCard label="Total Surplus Value" value={currency(metrics.totalSurplus)} />
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Pipeline Funnel</h2>
        <div className="mt-4 space-y-3">
          {[
            ['Raw', metrics.raw, '#7c3aed'],
            ['Cleared', metrics.cleared, '#10b981'],
            ['Ready', metrics.ready, '#3b82f6'],
            ['Dead', metrics.dead, '#ef4444'],
          ].map(([label, amount, color]) => (
            <div key={String(label)}>
              <div className="mb-1 flex justify-between text-xs text-zinc-400">
                <span>{String(label)}</span>
                <span>{String(amount)}</span>
              </div>
              <div className="h-2 rounded bg-[#1e1e2e]">
                <div className="h-2 rounded" style={{ width: `${percentage(Number(amount), metrics.total)}%`, backgroundColor: String(color) }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Recent Activity</h2>
          <div className="mt-3 divide-y divide-[#1e1e2e]">
            {recent.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">No leads yet. Seed demo data to get started.</p>
            ) : (
              recent.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`} className="flex items-center justify-between py-3 text-sm hover:text-violet-300">
                  <span>{lead.original_owner}</span>
                  <span className="text-xs text-zinc-500">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
                </Link>
              ))
            )}
          </div>
        </div>
        <QuickActions />
      </section>
    </div>
  );
}

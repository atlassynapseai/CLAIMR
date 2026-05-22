export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[#1e1e2e]" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-xl bg-[#1e1e2e]" />
        ))}
      </div>
    </div>
  );
}

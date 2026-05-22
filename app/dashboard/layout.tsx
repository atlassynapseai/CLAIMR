export const dynamic = 'force-dynamic';

import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

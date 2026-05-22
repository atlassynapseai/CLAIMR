'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Kanban, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'All Leads', icon: FileText },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-full border-r border-[#1e1e2e] bg-[#0e0e14] p-4">
      <div className="mb-6 rounded-xl border border-[#7c3aed]/40 bg-[#7c3aed]/10 p-4 text-center text-lg font-bold text-[#c4b5fd]">
        CLAIMR
      </div>
      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                active ? 'bg-[#7c3aed]/20 text-[#d8b4fe]' : 'text-zinc-300 hover:bg-[#1a1a2b]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

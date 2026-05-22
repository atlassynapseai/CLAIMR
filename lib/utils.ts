import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function parseMoney(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

export function currency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function badgeColor(value?: string | null) {
  if (value === 'CLEAN') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (value === 'RISK') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  if (value === 'DEAD') return 'bg-red-500/15 text-red-400 border-red-500/30';
  return 'bg-zinc-700/40 text-zinc-300 border-zinc-600';
}

export function percentage(amount: number, total: number): number {
  if (!total) return 0;
  return (amount / total) * 100;
}

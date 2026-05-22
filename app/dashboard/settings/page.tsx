import { SettingsPanel } from '@/components/settings-panel';

export default function SettingsPage() {
  const statuses = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    ATTOM_API_KEY: Boolean(process.env.ATTOM_API_KEY),
    SKIPIFY_API_KEY: Boolean(process.env.SKIPIFY_API_KEY),
    SURPLUS_CRON_SECRET: Boolean(process.env.SURPLUS_CRON_SECRET),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-zinc-400">Manage integrations and pipeline defaults.</p>
      <SettingsPanel statuses={statuses} />
    </div>
  );
}

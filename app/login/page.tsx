'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">CLAIMR Login</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to access your surplus recovery dashboard.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

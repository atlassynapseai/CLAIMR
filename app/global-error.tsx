'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4 text-white">
        <div className="card max-w-md p-6">
          <h2 className="text-lg font-semibold">Unexpected error</h2>
          <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
          <button className="btn-primary mt-4" onClick={reset}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}

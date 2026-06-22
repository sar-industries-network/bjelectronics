'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-x grid min-h-[70vh] place-items-center py-16">
      <section className="card max-w-xl bg-white p-8 text-center dark:bg-[#0b1424]">
        <div className="text-6xl">⚠️</div>
        <h1 className="mt-5 text-4xl font-black text-slate-950 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Please try again or return to the homepage.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn" onClick={() => reset()}>Try Again</button>
          <a href="/" className="btn-soft">Back Home</a>
        </div>
      </section>
    </main>
  );
}

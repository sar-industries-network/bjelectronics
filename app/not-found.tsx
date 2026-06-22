export default function NotFound() {
  return (
    <main className="container-x grid min-h-[70vh] place-items-center py-16">
      <section className="card max-w-xl bg-white p-8 text-center dark:bg-[#0b1424]">
        <div className="text-6xl">🔎</div>
        <h1 className="mt-5 text-4xl font-black text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">The page you are looking for may have moved or is not available.</p>
        <a href="/" className="btn mt-6">Back to Home</a>
      </section>
    </main>
  );
}

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-950 dark:bg-[#07111f] dark:text-white">
      <div className="card bg-white p-8 text-center dark:bg-[#0b1424]">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-brand-blue" />
        <b>Loading BJ ELECTRONICS...</b>
      </div>
    </main>
  );
}

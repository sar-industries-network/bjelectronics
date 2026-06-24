const phases = [
  ['Phase 1', 'Production Quality Foundation', 'Live', 'Storefront, admin workspace, secure checkout, build validation and responsive UI polish.'],
  ['Phase 2', 'Support and Feature Center', 'Beta', 'Customer help center, roadmap visibility, ticket flow planning and feedback collection.'],
  ['Phase 3', 'Inventory Intelligence', 'Next', 'Low-stock signals, inventory movement timeline, reorder widgets and supplier readiness.'],
  ['Phase 4', 'Marketing Automation', 'Planned', 'Promotion calendar, customer segments, campaign widgets and notification queue.'],
  ['Phase 5', 'Business Intelligence', 'Planned', 'Sales funnel, product ranking, category performance and customer value insights.']
];

export default function Page() {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#07111f]"><section className="container-x mx-auto"><header className="card p-6 md:p-8"><span className="store-section-kicker">Future Development</span><h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">BJ ELECTRONICS Roadmap</h1><p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-500 dark:text-slate-300">Professional future phases for storefront quality, admin operations, automation, security and growth.</p></header><div className="mt-6 grid gap-4 lg:grid-cols-2">{phases.map(([phase, title, status, text]) => <article className="card p-5" key={title}><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wider text-brand-blue">{phase}</span><b className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">{status}</b></div><h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{title}</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{text}</p></article>)}</div></section></main>;
}

import { CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { featureRoadmap, roadmapStats } from '@/lib/feature-registry';

const colors = {
  live: 'bg-green-50 text-green-700 border-green-200',
  beta: 'bg-blue-50 text-blue-700 border-blue-200',
  next: 'bg-amber-50 text-amber-700 border-amber-200',
  planned: 'bg-slate-50 text-slate-700 border-slate-200'
};

export function RoadmapPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#07111f]">
      <section className="container-x mx-auto">
        <header className="card p-6 md:p-8">
          <span className="store-section-kicker"><Rocket size={14}/> Future Development</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">BJ ELECTRONICS Roadmap</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-500 dark:text-slate-300">Professional future phases for storefront quality, admin operations, automation, security and growth.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <RoadmapStat label="Live" value={roadmapStats.live}/>
            <RoadmapStat label="Beta" value={roadmapStats.beta}/>
            <RoadmapStat label="Next" value={roadmapStats.next}/>
            <RoadmapStat label="Planned" value={roadmapStats.planned}/>
          </div>
        </header>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {featureRoadmap.map((item) => <article className="card p-5" key={item.id}><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wider text-brand-blue">{item.phase} · {item.area}</span><b className={`rounded-full border px-3 py-1 text-xs font-black ${colors[item.status]}`}>{item.status}</b></div><h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{item.title}</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{item.summary}</p><p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm font-black text-brand-blue dark:bg-white/10">{item.impact}</p><ul className="mt-4 grid gap-2">{item.checklist.map((step) => <li className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300" key={step}><CheckCircle2 size={16} className="text-green-500"/>{step}</li>)}</ul></article>)}
        </div>
      </section>
    </main>
  );
}

function RoadmapStat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"><Sparkles size={18} className="text-brand-blue"/><small className="mt-2 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</small><b className="text-2xl font-black text-slate-950 dark:text-white">{value}</b></div>;
}

import { CheckCircle2, HelpCircle, Mail, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';

export type InfoItem = { title: string; text: string };

const iconMap = {
  help: HelpCircle,
  delivery: Truck,
  return: ShoppingCart,
  warranty: ShieldCheck,
  contact: Mail,
  check: CheckCircle2,
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  items: InfoItem[];
  icon?: keyof typeof iconMap;
};

export function StaticInfoPage({ eyebrow, title, description, items, icon = 'check' }: Props) {
  const Icon = iconMap[icon];
  return (
    <main className="container-x py-10 md:py-14">
      <section className="card overflow-hidden bg-white p-6 dark:bg-[#0b1424] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <span className="badge-blue">{eyebrow}</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-red-500 p-8 text-white shadow-glow">
            <Icon size={54} />
            <h2 className="mt-5 text-2xl font-black">BJ ELECTRONICS Support</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">Premium customer service, secure ordering, fast delivery and clear warranty information for Bangladesh customers.</p>
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="card bg-white p-6 dark:bg-[#0b1424]">
            <CheckCircle2 className="text-brand-blue" />
            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

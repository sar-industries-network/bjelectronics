import { HelpCircle, Mail, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';

const faqs = [
  ['How do I track my order?', 'Use the Track Order page with your BJ order number and phone number.'],
  ['What payment methods are supported?', 'Cash on delivery is supported, and mobile payment verification can be enabled through the secure checkout flow.'],
  ['How does admin access work?', 'Admin users sign in with Supabase Auth and must have an active admin profile.'],
  ['How fast is delivery?', 'Inside Dhaka and outside Dhaka delivery options depend on stock and courier availability.']
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#07111f]">
      <section className="container-x mx-auto">
        <header className="card p-6 md:p-8">
          <span className="store-section-kicker"><HelpCircle size={14}/> Support Center</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">How can we help?</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-500 dark:text-slate-300">Find order, delivery, warranty, payment and account support information for BJ ELECTRONICS.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <InfoCard icon={<Phone/>} title="Call Support" text="09612-345678" />
            <InfoCard icon={<Mail/>} title="Email" text="support@bjelectronics.shop" />
            <InfoCard icon={<MapPin/>} title="Delivery" text="Inside and outside Dhaka" />
          </div>
        </header>
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="card p-5">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Frequently Asked Questions</h2>
            <div className="mt-4 grid gap-3">
              {faqs.map(([q, a]) => <details className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]" key={q}><summary className="cursor-pointer font-black text-slate-900 dark:text-white">{q}</summary><p className="mt-3 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{a}</p></details>)}
            </div>
          </div>
          <aside className="grid gap-4">
            <InfoCard icon={<Truck/>} title="Delivery Help" text="Check order tracking and delivery status from the tracking page." />
            <InfoCard icon={<ShieldCheck/>} title="Secure Checkout" text="Checkout is routed through secure backend processing and protected database rules." />
            <a className="btn" href="/track-order">Track Order</a>
            <a className="btn-soft" href="/roadmap">View Roadmap</a>
          </aside>
        </section>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-blue dark:bg-white/10">{icon}</span><h3 className="mt-4 font-black text-slate-950 dark:text-white">{title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">{text}</p></div>;
}

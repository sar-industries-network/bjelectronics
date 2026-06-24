import { AdminShell } from '@/components/admin-shell';

export default function Page() {
  return <AdminShell active="support"><section className="card p-6"><h1 className="text-3xl font-black">Support Inbox</h1><p className="mt-2 text-slate-500">Support tickets and feature requests are shown in the expanded dashboard at /admin/dashboard.</p><div className="mt-5 flex gap-3"><a className="btn" href="/admin/dashboard">Open Dashboard</a><a className="btn-soft" href="/help">Open Help Center</a></div></section></AdminShell>;
}

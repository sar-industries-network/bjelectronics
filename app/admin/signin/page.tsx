'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';

export default function AdminSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const profile = await supabase.from('admin_profiles').select('user_id, active').eq('user_id', userId).eq('active', true).maybeSingle();
      if (profile.data) {
        sessionStorage.setItem('bj_admin_session', 'true');
        router.push('/admin');
      }
    };
    if (supabaseClientConfigured) check();
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin/signin` },
    });
    setBusy(false);
    setStatus(error ? error.message : 'Check your email for the secure admin sign-in link.');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-[#07111f]">
      <form onSubmit={submit} className="card w-full max-w-md bg-white p-6 dark:bg-[#0b1424]">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-blue text-2xl text-white shadow-glow">🛒</div>
        <h1 className="mt-6 text-3xl font-black text-slate-950 dark:text-white">Admin Sign In</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Use an approved BJ ELECTRONICS admin email to receive a secure sign-in link.</p>
        {!supabaseClientConfigured && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-brand-red">Supabase env variables are missing.</p>}
        <label className="mt-5 block text-sm font-black text-slate-700 dark:text-slate-200">Admin Email</label>
        <input className="input mt-2 w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
        {status && <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-brand-blue">{status}</p>}
        <button className="btn mt-6 w-full" disabled={busy}>{busy ? 'Sending...' : 'Send Secure Link'}</button>
      </form>
    </main>
  );
}

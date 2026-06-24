'use client';

import React, { FormEvent, useState } from 'react';
import { Lightbulb, Send, TicketCheck } from 'lucide-react';
import { supabase, supabaseClientConfigured } from '@/lib/supabase/client';
import { rateLimitClient, SECURITY_LIMITS, validateClientSubmission } from '@/lib/client-security';

type SupportForm = { name: string; email: string; phone: string; subject: string; message: string };
type FeatureForm = { title: string; description: string; priority: 'low' | 'medium' | 'high'; requester_name: string; requester_email: string };

const initialSupport: SupportForm = { name: '', email: '', phone: '', subject: '', message: '' };
const initialFeature: FeatureForm = { title: '', description: '', priority: 'medium', requester_name: '', requester_email: '' };

const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

export function SupportCenterClient() {
  const [support, setSupport] = useState(initialSupport);
  const [feature, setFeature] = useState(initialFeature);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitSupport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(''); setError('');
    try { validateClientSubmission('support request'); } catch (err) { setError(err instanceof Error ? err.message : 'Request blocked.'); return; }
    if (!rateLimitClient('support-form', SECURITY_LIMITS.support.limit, SECURITY_LIMITS.support.windowMs)) { setError('Too many support requests. Please wait and try again.'); return; }
    if (!supabaseClientConfigured) { setError('Support system is not configured yet.'); return; }
    setBusy(true);
    const { error: submitError } = await supabase.from('support_tickets').insert({ id: uid('ticket'), ...support, status: 'open', source: 'storefront', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    setBusy(false);
    if (submitError) setError(submitError.message);
    else { setSupport(initialSupport); setNotice('Support ticket submitted successfully. Our team will review it soon.'); }
  };

  const submitFeature = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(''); setError('');
    try { validateClientSubmission('feature request'); } catch (err) { setError(err instanceof Error ? err.message : 'Request blocked.'); return; }
    if (!rateLimitClient('feature-request-form', SECURITY_LIMITS.featureRequest.limit, SECURITY_LIMITS.featureRequest.windowMs)) { setError('Too many feature requests. Please wait and try again.'); return; }
    if (!supabaseClientConfigured) { setError('Feature request system is not configured yet.'); return; }
    setBusy(true);
    const { error: submitError } = await supabase.from('feature_requests').insert({ id: uid('feature'), ...feature, status: 'planned', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    setBusy(false);
    if (submitError) setError(submitError.message);
    else { setFeature(initialFeature); setNotice('Feature request received. It is now added to the planning queue.'); }
  };

  return <section className="mt-6 grid gap-5 xl:grid-cols-2">{notice && <div className="admin-notice good xl:col-span-2">{notice}</div>}{error && <div className="admin-notice bad xl:col-span-2">{error}</div>}<form onSubmit={submitSupport} className="card grid gap-3 p-5"><span className="store-section-kicker"><TicketCheck size={14}/> Support Ticket</span><h2 className="text-2xl font-black text-slate-950 dark:text-white">Create support ticket</h2><input className="input" placeholder="Your name" value={support.name} onChange={(e) => setSupport({ ...support, name: e.target.value })} required minLength={2}/><input className="input" type="email" placeholder="Email address" value={support.email} onChange={(e) => setSupport({ ...support, email: e.target.value })}/><input className="input" placeholder="Phone number" value={support.phone} onChange={(e) => setSupport({ ...support, phone: e.target.value })}/><input className="input" placeholder="Subject" value={support.subject} onChange={(e) => setSupport({ ...support, subject: e.target.value })} required minLength={3}/><textarea className="input min-h-[130px] p-4" placeholder="Describe your issue in detail..." value={support.message} onChange={(e) => setSupport({ ...support, message: e.target.value })} required minLength={10}/><button className="btn" disabled={busy}><Send size={16}/> Submit Ticket</button></form><form onSubmit={submitFeature} className="card grid gap-3 p-5"><span className="store-section-kicker"><Lightbulb size={14}/> Feature Request</span><h2 className="text-2xl font-black text-slate-950 dark:text-white">Suggest a feature</h2><input className="input" placeholder="Feature title" value={feature.title} onChange={(e) => setFeature({ ...feature, title: e.target.value })} required minLength={3}/><select className="input" value={feature.priority} onChange={(e) => setFeature({ ...feature, priority: e.target.value as FeatureForm['priority'] })}><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select><input className="input" placeholder="Your name" value={feature.requester_name} onChange={(e) => setFeature({ ...feature, requester_name: e.target.value })}/><input className="input" type="email" placeholder="Email address" value={feature.requester_email} onChange={(e) => setFeature({ ...feature, requester_email: e.target.value })}/><textarea className="input min-h-[130px] p-4" placeholder="Explain the feature and why it matters..." value={feature.description} onChange={(e) => setFeature({ ...feature, description: e.target.value })} required minLength={10}/><button className="btn" disabled={busy}><Send size={16}/> Submit Feature Request</button></form></section>;
}

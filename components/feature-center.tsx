'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Rocket, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { ProActionBar, ProBadge, ProButton, ProCard, ProFilterChips, ProMiniBarChart, ProSearchBar, ProStatCard } from './pro-ui-kit';
import { FeatureStatus, featureRoadmap, roadmapStats } from '@/lib/feature-registry';

const statusTone: Record<FeatureStatus, 'success' | 'primary' | 'warning' | 'neutral'> = {
  live: 'success',
  beta: 'primary',
  next: 'warning',
  planned: 'neutral'
};

export function FeatureCenter() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    return featureRoadmap.filter((item) => {
      const matchesText = !text || `${item.title} ${item.area} ${item.summary} ${item.phase}`.toLowerCase().includes(text);
      const matchesStatus = status === 'all' || item.status === status;
      return matchesText && matchesStatus;
    });
  }, [query, status]);

  return (
    <AdminShell active="feature-center">
      <ProActionBar
        title="Future Development Center"
        description="Plan, organize and communicate BJ ELECTRONICS feature phases with a professional roadmap, quality checklist and implementation priority board."
        actions={[{ label: 'Roadmap', icon: <Rocket size={16}/> }, { label: 'Quality', icon: <ShieldCheck size={16}/>, tone: 'neutral' }]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-5">
        <ProStatCard icon={<CheckCircle2/>} label="Live Features" value={roadmapStats.live} sub="Production ready" tone="success" />
        <ProStatCard icon={<Sparkles/>} label="Beta Features" value={roadmapStats.beta} sub="Available for testing" />
        <ProStatCard icon={<Rocket/>} label="Next Features" value={roadmapStats.next} sub="Build priority" tone="warning" />
        <ProStatCard icon={<ClipboardList/>} label="Planned" value={roadmapStats.planned} sub="Future release" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px] mt-5">
        <ProCard title="Feature Roadmap" description="Search, filter, group and track all professional development phases.">
          <div className="grid gap-4">
            <ProSearchBar value={query} onChange={setQuery} placeholder="Search roadmap, phase, owner or feature..." />
            <ProFilterChips value={status} onChange={setStatus} options={[
              { label: 'All', value: 'all', count: featureRoadmap.length },
              { label: 'Live', value: 'live', count: roadmapStats.live },
              { label: 'Beta', value: 'beta', count: roadmapStats.beta },
              { label: 'Next', value: 'next', count: roadmapStats.next },
              { label: 'Planned', value: 'planned', count: roadmapStats.planned }
            ]} />
            <div className="feature-roadmap-grid">
              {filtered.map((item) => (
                <article className="feature-roadmap-card" key={item.id}>
                  <div>
                    <span>{item.phase} · {item.area}</span>
                    <ProBadge tone={statusTone[item.status]}>{item.status.toUpperCase()}</ProBadge>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <b>{item.impact}</b>
                  <ul>{item.checklist.map((step) => <li key={step}>{step}</li>)}</ul>
                  <footer><small>Owner: {item.owner}</small><ProButton size="sm" variant="soft" tone="neutral">View details</ProButton></footer>
                </article>
              ))}
            </div>
          </div>
        </ProCard>

        <div className="grid gap-5">
          <ProCard title="Feature Mix" description="Roadmap distribution by status.">
            <ProMiniBarChart data={[
              { label: 'Live', value: roadmapStats.live },
              { label: 'Beta', value: roadmapStats.beta },
              { label: 'Next', value: roadmapStats.next },
              { label: 'Plan', value: roadmapStats.planned }
            ]} />
          </ProCard>
          <ProCard title="Release Quality Gate" description="Use before every production release.">
            <div className="feature-checklist">
              {['Verify command passes', 'Environment variables configured', 'Admin sign-in tested', 'Checkout function tested', 'Route smoke tested', 'Build artifact created'].map((item) => <span key={item}><CheckCircle2 size={16}/>{item}</span>)}
            </div>
          </ProCard>
        </div>
      </section>
    </AdminShell>
  );
}

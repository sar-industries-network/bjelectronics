'use client';

import { CheckCircle2, Download, Filter, Package, RefreshCcw, Search, Truck } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { ProActionBar, ProBadge, ProButton, ProCard, ProDetailList, ProEmpty, ProField, ProInput, ProMiniBarChart, ProSelect, ProStatCard, ProTextarea } from './pro-ui-kit';

export function ProUIShowcase() {
  return (
    <AdminShell active="ui-kit">
      <ProActionBar title="Professional UI Kit" description="Reusable components for clean screens, forms, tables, filters, widgets and dashboard layouts." actions={[{ label: 'Refresh', icon: <RefreshCcw size={16}/> }, { label: 'Export', icon: <Download size={16}/>, tone: 'neutral' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-5">
        <ProStatCard icon={<Package/>} label="Products" value="128" sub="Active catalogue" />
        <ProStatCard icon={<Truck/>} label="Orders" value="36" sub="Needs processing" tone="warning" />
        <ProStatCard icon={<CheckCircle2/>} label="Success" value="98%" sub="Checkout health" tone="success" />
        <ProStatCard icon={<Search/>} label="Search" value="Fast" sub="Optimized UX" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_420px] mt-5">
        <ProCard title="Forms & Inputs" description="Reusable field, input, select and text area components.">
          <div className="grid gap-3">
            <ProField label="Product Name" description="Use a short, searchable product title."><ProInput placeholder="Samsung Galaxy A55 5G" /></ProField>
            <ProField label="Category"><ProSelect options={[{ label: 'Smartphones', value: 'smartphones' }, { label: 'Laptops', value: 'laptops' }, { label: 'Audio', value: 'audio' }]} /></ProField>
            <ProField label="Description"><ProTextarea placeholder="Write a clean product description..." /></ProField>
            <div className="flex flex-wrap gap-2"><ProButton icon={<CheckCircle2 size={16}/>}>Save</ProButton><ProButton variant="soft" tone="neutral" icon={<Filter size={16}/>}>Filter</ProButton></div>
          </div>
        </ProCard>
        <ProCard title="Charts & Details" description="Widgets for dashboard information.">
          <ProMiniBarChart data={[{ label: 'Phones', value: 72 }, { label: 'Laptop', value: 54 }, { label: 'Audio', value: 38 }, { label: 'TV', value: 18 }]} />
          <div className="mt-4"><ProDetailList items={[{ label: 'Status', value: <ProBadge tone="success">Healthy</ProBadge> }, { label: 'Version', value: '2.1.2' }, { label: 'Mode', value: 'Production' }]} /></div>
        </ProCard>
      </section>
      <section className="grid gap-5 md:grid-cols-2 mt-5">
        <ProCard title="Actions"><div className="flex flex-wrap gap-2"><ProButton>Primary Action</ProButton><ProButton variant="soft" tone="success">Approve</ProButton><ProButton variant="soft" tone="danger">Reject</ProButton></div></ProCard>
        <ProCard title="Empty State"><ProEmpty title="No records selected" description="Choose a record from the table to see details here." /></ProCard>
      </section>
    </AdminShell>
  );
}

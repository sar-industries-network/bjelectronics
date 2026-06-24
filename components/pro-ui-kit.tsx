'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, CircleCheck, Download, Filter, Info, MoreHorizontal, Search, SlidersHorizontal, Star } from 'lucide-react';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  tone?: Tone;
};

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
};

const toneClass: Record<Tone, string> = {
  neutral: 'ui-tone-neutral',
  primary: 'ui-tone-primary',
  success: 'ui-tone-success',
  warning: 'ui-tone-warning',
  danger: 'ui-tone-danger'
};

export function ProButton({ children, icon, tone = 'primary', size = 'md', variant = 'solid', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; tone?: Tone; size?: Size; variant?: 'solid' | 'soft' | 'ghost' }) {
  return <button {...props} className={`pro-btn ${toneClass[tone]} ${size} ${variant} ${className}`}>{icon}{children}</button>;
}

export function ProCard({ children, title, description, action, className = '' }: { children: React.ReactNode; title?: string; description?: string; action?: React.ReactNode; className?: string }) {
  return <section className={`pro-card ${className}`}>{(title || description || action) && <div className="pro-card-head"><div>{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>{action}</div>}{children}</section>;
}

export function ProBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`pro-badge ${toneClass[tone]}`}>{children}</span>;
}

export function ProField({ label, description, error, children }: { label: string; description?: string; error?: string; children: React.ReactNode }) {
  return <label className="pro-field"><span>{label}</span>{children}{description && <small>{description}</small>}{error && <em>{error}</em>}</label>;
}

export function ProInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`pro-input ${props.className || ''}`} />;
}

export function ProTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`pro-input pro-textarea ${props.className || ''}`} />;
}

export function ProSelect({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ label: string; value: string }> }) {
  return <select {...props} className={`pro-input ${props.className || ''}`}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

export function ProSearchBar({ value, onChange, placeholder = 'Search...', action }: { value: string; onChange: (value: string) => void; placeholder?: string; action?: React.ReactNode }) {
  return <div className="pro-searchbar"><Search size={17}/><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/>{action}</div>;
}

export function ProActionBar({ title, description, actions = [] }: { title: string; description?: string; actions?: Action[] }) {
  return <div className="pro-actionbar"><div><span>Workspace</span><h2>{title}</h2>{description && <p>{description}</p>}</div><div>{actions.map((action) => action.href ? <a key={action.label} className={`pro-btn soft ${toneClass[action.tone || 'neutral']}`} href={action.href}>{action.icon}{action.label}</a> : <ProButton key={action.label} variant="soft" tone={action.tone || 'neutral'} icon={action.icon} onClick={action.onClick}>{action.label}</ProButton>)}</div></div>;
}

export function ProStatCard({ label, value, sub, icon, tone = 'primary' }: { label: string; value: React.ReactNode; sub?: string; icon?: React.ReactNode; tone?: Tone }) {
  return <article className={`pro-stat ${toneClass[tone]}`}><span>{icon || <Star size={18}/>}</span><small>{label}</small><b>{value}</b>{sub && <p>{sub}</p>}</article>;
}

export function ProTabs({ tabs, active, onChange }: { tabs: Array<{ key: string; label: string; count?: number }>; active: string; onChange: (key: string) => void }) {
  return <div className="pro-tabs" role="tablist">{tabs.map((tab) => <button type="button" role="tab" aria-selected={active === tab.key} className={active === tab.key ? 'active' : ''} key={tab.key} onClick={() => onChange(tab.key)}>{tab.label}{typeof tab.count === 'number' && <span>{tab.count}</span>}</button>)}</div>;
}

export function ProAccordion({ items }: { items: Array<{ title: string; content: React.ReactNode; badge?: React.ReactNode }> }) {
  return <div className="pro-accordion">{items.map((item, index) => <details key={index}><summary><span>{item.title}</span>{item.badge}<ChevronDown size={16}/></summary><div>{item.content}</div></details>)}</div>;
}

export function ProDropdown({ label = 'Options', actions }: { label?: string; actions: Action[] }) {
  const [open, setOpen] = useState(false);
  return <div className="pro-dropdown"><button type="button" onClick={() => setOpen(!open)}><MoreHorizontal size={18}/>{label}</button>{open && <div className="pro-dropdown-menu">{actions.map((action) => action.href ? <a key={action.label} href={action.href}>{action.icon}{action.label}</a> : <button type="button" key={action.label} onClick={() => { setOpen(false); action.onClick?.(); }}>{action.icon}{action.label}</button>)}</div>}</div>;
}

export function ProDataTable<T extends Record<string, unknown>>({ rows, columns, pageSize = 8, searchable = true }: { rows: T[]; columns: Column<T>[]; pageSize?: number; searchable?: boolean }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    const base = text ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(text)) : rows;
    if (!sortKey) return base;
    return [...base].sort((a, b) => String(a[sortKey] || '').localeCompare(String(b[sortKey] || '')));
  }, [rows, query, sortKey]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  return <div className="pro-data-table">{searchable && <div className="pro-table-toolbar"><ProSearchBar value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search table data..."/><ProButton variant="soft" tone="neutral" icon={<SlidersHorizontal size={16}/>}>Filters</ProButton><ProButton variant="soft" tone="neutral" icon={<Download size={16}/>}>Export</ProButton></div>}<div className="pro-table-scroll"><table><thead><tr>{columns.map((column) => <th key={String(column.key)} className={column.align || 'left'}><button type="button" disabled={!column.sortable} onClick={() => setSortKey(String(column.key))}>{column.label}{column.sortable && <ChevronsUpDown size={14}/>}</button></th>)}</tr></thead><tbody>{visible.map((row, index) => <tr key={index}>{columns.map((column) => <td key={String(column.key)} className={column.align || 'left'}>{column.render ? column.render(row) : String(row[column.key] ?? '')}</td>)}</tr>)}</tbody></table></div>{!visible.length && <ProEmpty title="No data found" description="Try changing the search or filter options."/>}<ProPagination page={safePage} totalPages={totalPages} onChange={setPage} totalItems={filtered.length}/></div>;
}

export function ProPagination({ page, totalPages, totalItems, onChange }: { page: number; totalPages: number; totalItems?: number; onChange: (page: number) => void }) {
  return <div className="pro-pagination"><span>{typeof totalItems === 'number' ? `${totalItems} item(s)` : `Page ${page} of ${totalPages}`}</span><div><button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}><ChevronLeft size={16}/>Prev</button><b>{page} / {totalPages}</b><button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next<ChevronRight size={16}/></button></div></div>;
}

export function ProEmpty({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return <div className="pro-empty">{icon || <Info size={22}/>}<b>{title}</b>{description && <p>{description}</p>}</div>;
}

export function ProDetailList({ items }: { items: Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> }) {
  return <div className="pro-detail-list">{items.map((item) => <div key={item.label}>{item.icon || <CircleCheck size={16}/>}<span>{item.label}</span><b>{item.value}</b></div>)}</div>;
}

export function ProMiniBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <div className="pro-chart">{data.map((item) => <div key={item.label}><span>{item.label}</span><i style={{ width: `${Math.max(5, Math.round((item.value / max) * 100))}%` }}/><b>{item.value}</b></div>)}</div>;
}

export function ProFilterChips({ options, value, onChange }: { options: Array<{ label: string; value: string; count?: number }>; value: string; onChange: (value: string) => void }) {
  return <div className="pro-chips"><span><Filter size={15}/> Filter</span>{options.map((option) => <button type="button" key={option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>{option.label}{typeof option.count === 'number' && <em>{option.count}</em>}</button>)}</div>;
}

export type FeatureStatus = 'live' | 'beta' | 'next' | 'planned';
export type FeatureArea = 'Storefront' | 'Admin' | 'Operations' | 'Automation' | 'Security' | 'Growth';

export type FeatureItem = {
  id: string;
  title: string;
  area: FeatureArea;
  status: FeatureStatus;
  phase: string;
  summary: string;
  impact: string;
  owner: string;
  checklist: string[];
};

export const featureRoadmap: FeatureItem[] = [
  {
    id: 'smart-storefront',
    title: 'Smart Storefront Experience',
    area: 'Storefront',
    status: 'live',
    phase: 'Phase 1',
    summary: 'Responsive product discovery, category browsing, cart, checkout and order tracking.',
    impact: 'Improves customer conversion and mobile shopping quality.',
    owner: 'Commerce Team',
    checklist: ['Responsive homepage', 'Product detail media', 'Cart and checkout', 'Order tracking']
  },
  {
    id: 'admin-command-center',
    title: 'Admin Command Center',
    area: 'Admin',
    status: 'live',
    phase: 'Phase 1',
    summary: 'Protected admin workspace for products, orders, settings, UI resources and platform control.',
    impact: 'Centralizes daily ecommerce operations and reduces manual work.',
    owner: 'Operations Team',
    checklist: ['Supabase auth gate', 'Product manager', 'Order operations', 'Settings overview']
  },
  {
    id: 'support-feature-center',
    title: 'Support & Feature Center',
    area: 'Growth',
    status: 'beta',
    phase: 'Phase 2',
    summary: 'Customer support entry point and admin roadmap overview for planned improvements.',
    impact: 'Creates feedback loop for customer issues and product improvements.',
    owner: 'Support Team',
    checklist: ['Help page', 'Ticket form', 'Roadmap view', 'Admin planning board']
  },
  {
    id: 'inventory-intelligence',
    title: 'Inventory Intelligence',
    area: 'Operations',
    status: 'next',
    phase: 'Phase 3',
    summary: 'Low-stock warnings, reorder signals, movement history and supplier readiness indicators.',
    impact: 'Prevents stockouts and improves purchasing decisions.',
    owner: 'Inventory Team',
    checklist: ['Low stock scoring', 'Inventory movement log', 'Reorder widgets', 'Supplier notes']
  },
  {
    id: 'marketing-automation',
    title: 'Marketing Automation',
    area: 'Automation',
    status: 'planned',
    phase: 'Phase 4',
    summary: 'Campaign widgets, customer segmentation, promotion scheduling and notification triggers.',
    impact: 'Supports repeat sales and seasonal campaign management.',
    owner: 'Growth Team',
    checklist: ['Customer segments', 'Promotion calendar', 'Campaign reports', 'Notification queue']
  },
  {
    id: 'security-observability',
    title: 'Security & Observability',
    area: 'Security',
    status: 'live',
    phase: 'Continuous',
    summary: 'Secret scanning, environment validation, build audit, secure checkout and RLS-backed admin data.',
    impact: 'Keeps deployments safer and easier to verify before production release.',
    owner: 'Platform Team',
    checklist: ['Secret scan', 'Environment validation', 'Secure checkout', 'Build health report']
  }
];

export const roadmapStats = featureRoadmap.reduce<Record<FeatureStatus, number>>((acc, item) => {
  acc[item.status] += 1;
  return acc;
}, { live: 0, beta: 0, next: 0, planned: 0 });

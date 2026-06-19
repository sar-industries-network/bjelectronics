import { EnterpriseApp } from '@/components/enterprise-app';
export function generateStaticParams() { return [{ orderNumber: 'BJ-DEMO-2026' }]; }
export default function Page() { return <EnterpriseApp />; }

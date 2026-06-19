import { EnterpriseApp } from '@/components/enterprise-app';
import { seedProducts } from '@/lib/demo-data';
export function generateStaticParams() { return seedProducts.map((p) => ({ slug: p.slug })); }
export default function Page() { return <EnterpriseApp />; }

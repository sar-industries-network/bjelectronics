import { EnterpriseApp } from '@/components/enterprise-app';
import { seedCategories } from '@/lib/demo-data';
export function generateStaticParams() { return seedCategories.map((c) => ({ slug: c.slug })); }
export default function Page() { return <EnterpriseApp />; }

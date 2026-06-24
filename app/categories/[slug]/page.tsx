import { seedCategories } from '@/lib/demo-data';
export { default } from '../../page';
export function generateStaticParams() { return seedCategories.map((c) => ({ slug: c.slug })); }

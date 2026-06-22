import { ProfessionalProductDetail } from '@/components/pro-product-detail';
import { seedProducts } from '@/lib/demo-data';

export function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProfessionalProductDetail slug={slug} />;
}

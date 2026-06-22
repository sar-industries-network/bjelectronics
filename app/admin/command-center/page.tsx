import dynamic from 'next/dynamic';

const CommandCenter = dynamic(() => import('@/components/ops-dashboard').then((module) => module.OpsDashboard), { ssr: false });

export default function Page() {
  return <CommandCenter />;
}

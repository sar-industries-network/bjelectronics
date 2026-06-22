import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Terms" icon="check" title="Terms & Conditions" description="General shopping terms for BJ ELECTRONICS customers and store operations." items={[{title:'Product Information',text:'Product price, stock and specification may change based on availability and store updates.'},{title:'Order Acceptance',text:'Orders are reviewed before confirmation and processing.'},{title:'Customer Details',text:'Accurate name, phone and address help complete order processing smoothly.'},{title:'Policy Updates',text:'Store policy information may be updated to improve clarity and service quality.'}]} />;
}

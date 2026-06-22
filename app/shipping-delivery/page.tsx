import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Delivery" icon="delivery" title="Shipping & Delivery" description="Clear delivery information for BJ ELECTRONICS orders across Bangladesh." items={[{title:'Inside Dhaka',text:'Inside Dhaka delivery is usually faster and shown clearly during checkout.'},{title:'Outside Dhaka',text:'Outside Dhaka delivery depends on courier route, product size and destination area.'},{title:'Secure Packaging',text:'Products are packed carefully before dispatch to reduce handling damage.'},{title:'Delivery Updates',text:'Use Track Order to check order number or phone based delivery status.'}]} />;
}

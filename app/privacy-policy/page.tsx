import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Privacy" icon="warranty" title="Privacy Policy" description="BJ ELECTRONICS keeps customer information focused on order processing, delivery, support and store improvement." items={[{title:'Order Information',text:'Customer details are used for order confirmation, delivery and after-sales support.'},{title:'Secure Handling',text:'Access to operational data should be limited to authorized store operators.'},{title:'Service Improvement',text:'General store activity can be used to improve products, layout and service quality.'},{title:'Customer Support',text:'Support may use order details to verify requests and provide accurate assistance.'}]} />;
}

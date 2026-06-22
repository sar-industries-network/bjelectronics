import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Customer Service" icon="help" title="Help Center" description="Find quick answers for shopping, checkout, delivery, warranty and support at BJ ELECTRONICS." items={[{title:'Order Support',text:'Track order progress, confirm order details and understand processing, shipping and delivery status.'},{title:'Checkout Help',text:'Get guidance for completing checkout safely and reviewing your order summary.'},{title:'Product Support',text:'Check product specification, stock, warranty and replacement information before buying.'},{title:'After Sales',text:'Use your order number and phone number when requesting faster support.'}]} />;
}

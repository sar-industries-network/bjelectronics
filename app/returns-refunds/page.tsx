import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Policy" icon="return" title="Returns & Refunds" description="A simple overview of return, replacement and issue reporting flow for BJ ELECTRONICS customers." items={[{title:'Report Quickly',text:'Report product issues with order number, phone number and product details as soon as possible.'},{title:'Condition Check',text:'Products must be checked with packaging, accessories and warranty information where applicable.'},{title:'Replacement Review',text:'Replacement approval depends on product condition, store policy and brand policy.'},{title:'Support Flow',text:'Support will guide the next step after reviewing the issue details.'}]} />;
}

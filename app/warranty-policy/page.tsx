import { StaticInfoPage } from '@/components/static-info-page';

export default function Page() {
  return <StaticInfoPage eyebrow="Warranty" icon="warranty" title="Warranty Policy" description="Understand warranty information before and after buying products from BJ ELECTRONICS." items={[{title:'Official Warranty',text:'Official warranty follows the policy of the product brand or authorized service channel.'},{title:'Warranty Proof',text:'Keep order details, packaging and product information for smoother service support.'},{title:'Service Review',text:'Warranty service may require product inspection before approval.'},{title:'Clear Information',text:'Warranty notes are shown on product pages and can be confirmed before purchase.'}]} />;
}

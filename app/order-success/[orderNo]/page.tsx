import { seedOrders } from '@/lib/demo-data';
export { default } from '../../page';

export function generateStaticParams() {
  return [{ orderNo: 'BJ-SMOKE-001' }, ...seedOrders.map((order) => ({ orderNo: order.order_number }))];
}

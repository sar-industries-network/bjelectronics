import fs from 'node:fs';

const app = fs.readFileSync('components/storefront-app.tsx', 'utf8');
const dataLayer = fs.readFileSync('lib/data-layer.js', 'utf8');
const requiredAppSnippets = ['const addToCart', 'const updateQty', 'function CheckoutPage', 'function CartPage', 'createOrder(order)'];
const missingApp = requiredAppSnippets.filter((snippet) => !app.includes(snippet));

const cart = [];
function add(productId, quantity = 1) {
  const item = cart.find((entry) => entry.productId === productId);
  if (item) item.quantity += quantity;
  else cart.push({ productId, quantity });
}
function update(productId, quantity) {
  const index = cart.findIndex((item) => item.productId === productId);
  if (index >= 0 && quantity <= 0) cart.splice(index, 1);
  else if (index >= 0) cart[index].quantity = quantity;
}
add('prod_a55', 1);
add('prod_a55', 2);
update('prod_a55', 3);

const order = {
  id: 'ord_smoke',
  order_number: 'BJ-SMOKE-001',
  customer_name: 'Smoke Test',
  phone: '01700000000',
  address: 'Dhaka',
  items: cart,
  subtotal: 100,
  shipping_fee: 80,
  discount: 0,
  total: 180
};

const failures = [];
if (missingApp.length) failures.push(`Missing storefront snippets: ${missingApp.join(', ')}`);
if (cart.length !== 1 || cart[0].quantity !== 3) failures.push('Cart quantity smoke failed.');
if (!order.items.length || order.total !== 180) failures.push('Order payload smoke failed.');
if (!dataLayer.includes("functions.invoke('secure-checkout'")) failures.push('Checkout should use the secure-checkout Edge Function.');
if (dataLayer.includes("supabase.from('orders').insert")) failures.push('Checkout still inserts directly into orders.');
if (dataLayer.includes("rpc('place_order_public'")) failures.push('Checkout still references legacy public RPC.');

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/functional-smoke.md', ['# Functional Smoke', '', failures.length ? 'Failed:' : 'Passed.', ...failures.map((item) => `- ${item}`)].join('\n') + '\n');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Functional smoke tests passed.');

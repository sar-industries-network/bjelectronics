-- Production-ready seed data for BJ Electronics
-- Safe for development + testing only

INSERT INTO products (id, name, slug, price, discount_price, image, rating, stock, category, description)
VALUES
('p1001', 'iPhone 15 Pro Max', 'iphone-15-pro-max', 189999, 179999, '/products/iphone15.jpg', 4.8, 20, 'Smartphones', 'Latest Apple flagship with A17 Pro chip and titanium design'),

('p1002', 'Samsung Galaxy S24 Ultra', 's24-ultra', 165000, 155000, '/products/s24.jpg', 4.7, 18, 'Smartphones', 'Premium Android flagship with S-Pen and AI camera system'),

('p1003', 'MacBook Air M2', 'macbook-air-m2', 135000, 129000, '/products/macbook-air.jpg', 4.9, 10, 'Laptops', 'Ultra-thin Apple laptop powered by M2 chip'),

('p1004', 'Dell XPS 13', 'dell-xps-13', 125000, 118000, '/products/dell-xps.jpg', 4.6, 12, 'Laptops', 'Premium Windows ultrabook with InfinityEdge display'),

('p1005', 'Sony WH-1000XM5', 'sony-wh1000xm5', 42000, 38999, '/products/sony-headphones.jpg', 4.9, 30, 'Audio', 'Industry leading noise cancelling headphones'),

('p1006', 'Apple AirPods Pro 2', 'airpods-pro-2', 32000, 29999, '/products/airpods.jpg', 4.8, 40, 'Audio', 'Active noise cancelling earbuds with spatial audio'),

('p1007', 'Samsung 55" QLED 4K TV', 'samsung-qled-55', 98000, 92000, '/products/tv.jpg', 4.7, 8, 'TV & Display', 'Ultra HD smart TV with Quantum Dot technology'),

('p1008', 'Xiaomi 20000mAh Power Bank', 'xiaomi-powerbank-20000', 3500, 2999, '/products/powerbank.jpg', 4.5, 100, 'Accessories', 'Fast charging high capacity power bank');

-- Enable realtime support note
-- Ensure Supabase realtime is enabled for products table

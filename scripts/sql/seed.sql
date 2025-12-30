-- Database Seeding SQL Script
-- Run this in your Supabase SQL Editor to seed initial data

-- ============================================
-- 1. CATEGORIES (UPSERT: Insert or Update)
-- ============================================
-- This will INSERT new categories or UPDATE existing ones
-- Safe to run multiple times - won't create duplicates

INSERT INTO categories (id, name, image, description)
VALUES
  ('cat-1', 'Fruits & Vegetables', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', 'Fresh fruits and vegetables'),
  ('cat-2', 'Dairy & Eggs', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 'Fresh dairy products and eggs'),
  ('cat-3', 'Beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', 'Drinks and beverages'),
  ('cat-4', 'Snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', 'Snacks and munchies'),
  ('cat-5', 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'Fresh baked goods'),
  ('cat-6', 'Meat & Seafood', 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', 'Fresh meat and seafood'),
  ('cat-7', 'Grocery & Kitchen', 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400', 'Kitchen essentials and groceries'),
  ('cat-8', 'Beauty & Personal Care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'Beauty products and personal care items'),
  ('cat-9', 'Household Essentials', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'Household cleaning and essentials'),
  ('cat-10', 'Baby Care', 'https://images.unsplash.com/photo-1515488042361-ee00e0d4d24e?w=400', 'Baby products and care items'),
  ('cat-11', 'Health & Pharma', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 'Health supplements and medicines'),
  ('cat-12', 'Electronics', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400', 'Electronics and gadgets'),
  ('cat-13', 'Fashion & Clothing', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', 'Fashion and clothing items'),
  ('cat-14', 'Sports & Fitness', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'Sports equipment and fitness gear'),
  ('cat-15', 'Books & Stationery', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', 'Books and stationery items')
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- 2. PRODUCTS
-- ============================================
INSERT INTO products (name, image_url, price, description, category_id, in_stock, rating)
VALUES
  -- Fruits & Vegetables (Prices in INR)
  ('Fresh Apples', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 250, 'Crisp and juicy red apples', 'cat-1', true, 4.5),
  ('Organic Bananas', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 80, 'Fresh organic bananas', 'cat-1', true, 4.7),
  ('Fresh Tomatoes', 'https://images.unsplash.com/photo-1546095667-0c3c7e0e3c3e?w=400', 60, 'Ripe red tomatoes', 'cat-1', true, 4.3),
  ('Fresh Carrots', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', 50, 'Fresh orange carrots', 'cat-1', true, 4.6),
  ('Fresh Spinach', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', 40, 'Fresh leafy spinach', 'cat-1', true, 4.4),
  ('Broccoli', 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400', 120, 'Fresh broccoli florets', 'cat-1', true, 4.5),

  -- Dairy & Eggs (Prices in INR)
  ('Fresh Milk', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 66, 'Whole milk, 1 liter', 'cat-2', true, 4.8),
  ('Free Range Eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 120, 'Dozen free range eggs', 'cat-2', true, 4.9),
  ('Greek Yogurt', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 150, 'Creamy Greek yogurt', 'cat-2', true, 4.7),
  ('Butter', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400', 120, 'Premium butter', 'cat-2', true, 4.6),
  ('Cheese', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', 280, 'Fresh cheese', 'cat-2', true, 4.8),

  -- Beverages (Prices in INR)
  ('Orange Juice', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 120, 'Fresh squeezed orange juice', 'cat-3', true, 4.5),
  ('Coffee Beans', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 450, 'Premium coffee beans', 'cat-3', true, 4.8),
  ('Green Tea', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 180, 'Organic green tea', 'cat-3', true, 4.6),
  ('Sparkling Water', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', 50, 'Refreshing sparkling water', 'cat-3', true, 4.4),
  ('Energy Drink', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 100, 'Energy boosting drink', 'cat-3', true, 4.3),

  -- Snacks (Prices in INR)
  ('Potato Chips', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', 20, 'Crispy potato chips', 'cat-4', true, 4.4),
  ('Chocolate Cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 150, 'Delicious chocolate cookies', 'cat-4', true, 4.7),
  ('Nuts Mix', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', 350, 'Mixed nuts', 'cat-4', true, 4.6),
  ('Granola Bars', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 200, 'Healthy granola bars', 'cat-4', true, 4.5),

  -- Bakery (Prices in INR)
  ('Fresh Bread', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 45, 'Freshly baked bread', 'cat-5', true, 4.6),
  ('Croissants', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 80, 'Buttery croissants', 'cat-5', true, 4.8),
  ('Bagels', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400', 100, 'Fresh bagels', 'cat-5', true, 4.7),
  ('Muffins', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 120, 'Assorted muffins', 'cat-5', true, 4.6),

  -- Meat & Seafood (Prices in INR)
  ('Chicken Breast', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', 350, 'Fresh chicken breast per kg', 'cat-6', true, 4.5),
  ('Salmon Fillet', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', 1200, 'Fresh salmon fillet per kg', 'cat-6', true, 4.9),
  ('Ground Beef', 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', 500, 'Fresh ground beef per kg', 'cat-6', true, 4.6),
  ('Shrimp', 'https://images.unsplash.com/photo-1606914501443-4c0c3c0c0c0c?w=400', 600, 'Fresh shrimp per kg', 'cat-6', true, 4.7)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. OFFERS (All amounts in INR)
-- ============================================
INSERT INTO offers (promo_code, discount_type, discount_value, min_order_amount, max_discount, valid_from, valid_until, is_active, title, description)
VALUES
  ('WELCOME10', 'percentage', 10, 500, 100, NOW(), NOW() + INTERVAL '30 days', true, 'Welcome Offer', 'Get 10% off on your first order'),
  ('FLASH50', 'percentage', 50, 2000, 500, NOW(), NOW() + INTERVAL '7 days', true, 'Flash Sale', '50% off on orders above ₹2000'),
  ('FREESHIP', 'fixed', 50, 1000, 50, NOW(), NOW() + INTERVAL '60 days', true, 'Free Shipping', 'Free shipping on orders above ₹1000'),
  ('SAVE20', 'percentage', 20, 1500, 300, NOW(), NOW() + INTERVAL '15 days', true, 'Save 20%', '20% off on orders above ₹1500'),
  ('NEWUSER', 'fixed', 100, 500, 100, NOW(), NOW() + INTERVAL '90 days', true, 'New User Bonus', '₹100 off for new users')
ON CONFLICT (promo_code) DO NOTHING;

-- ============================================
-- 4. VERIFY DATA
-- ============================================
SELECT
  'Categories' as table_name,
  COUNT(*) as count
FROM categories
UNION ALL
SELECT
  'Products' as table_name,
  COUNT(*) as count
FROM products
UNION ALL
SELECT
  'Offers' as table_name,
  COUNT(*) as count
FROM offers;


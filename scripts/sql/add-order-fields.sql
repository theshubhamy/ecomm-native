-- ============================================
-- Migration: Add new fields to orders table
-- Description: Adds subtotal, discount_amount, handling_charge, and applied_offer_id
-- Date: 2024
-- ============================================

-- Add subtotal column (original order total before discounts)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);

-- Add discount_amount column (amount discounted from order)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add handling_charge column (fixed handling charge)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS handling_charge DECIMAL(10, 2) DEFAULT 0;

-- Add applied_offer_id column (reference to the applied offer/coupon)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS applied_offer_id UUID;

-- Add foreign key constraint to offers table
-- Note: Run this separately if the column was already added without the constraint
-- This will fail if the constraint already exists, which is safe to ignore
ALTER TABLE orders
ADD CONSTRAINT fk_orders_applied_offer
FOREIGN KEY (applied_offer_id) REFERENCES offers(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.subtotal IS 'Original order subtotal before discounts';
COMMENT ON COLUMN orders.discount_amount IS 'Discount amount applied to the order';
COMMENT ON COLUMN orders.handling_charge IS 'Fixed handling charge for the order';
COMMENT ON COLUMN orders.applied_offer_id IS 'Reference to the applied offer/coupon';


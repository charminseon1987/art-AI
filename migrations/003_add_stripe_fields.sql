-- Migration: Add Stripe payment fields to payments table
-- Created: 2026-01-24
-- Description: Adds Stripe-specific fields to the payments table while maintaining Portone compatibility

-- Add Stripe-related columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_response JSONB;

-- Create indexes for Stripe fields
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);

-- Add comment to document the dual payment system support
COMMENT ON COLUMN payments.merchant_uid IS 'Portone merchant UID (for Portone/Iamport compatibility)';
COMMENT ON COLUMN payments.imp_uid IS 'Portone imp_uid (for Portone/Iamport compatibility)';
COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN payments.stripe_checkout_session_id IS 'Stripe Checkout Session ID';
COMMENT ON COLUMN payments.stripe_customer_id IS 'Stripe Customer ID (optional)';
COMMENT ON COLUMN payments.portone_response IS 'Portone/Iamport response data (JSONB)';
COMMENT ON COLUMN payments.stripe_response IS 'Stripe response data (JSONB)';

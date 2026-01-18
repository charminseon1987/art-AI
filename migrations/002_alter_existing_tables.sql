-- Migration: Alter existing tables for phone auth and paid usage tracking
-- Created: 2026-01-17
-- Description: Adds phone authentication fields to profiles and paid usage tracking to user_usage_limits

-- Add phone authentication fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'phone';

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);

-- Add paid usage tracking to user_usage_limits table
ALTER TABLE user_usage_limits
ADD COLUMN IF NOT EXISTS image_analysis_paid_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Add comment to clarify auth_provider values
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication method: phone, email, google (deprecated), kakao (deprecated)';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number in format: 010-xxxx-xxxx';
COMMENT ON COLUMN user_usage_limits.image_analysis_paid_count IS 'Count of paid drawing consultations (990원 each)';

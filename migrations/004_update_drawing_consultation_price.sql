-- Migration: Update drawing consultation service price
-- Created: 2026-01-24
-- Description: Updates the price of drawing consultation service from 990 KRW to 14,900 KRW ($14.90 USD equivalent)
-- NOTE: This migration should only be run if services table already exists.
-- If you're setting up a new database, the price is already set to 14900 in migration 001.

-- Check if services table exists and update price if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
    ) THEN
        -- Update drawing consultation service price
        UPDATE services 
        SET price_krw = 14900,
            updated_at = NOW()
        WHERE service_type = 'drawing_consultation';
        
        RAISE NOTICE 'Price updated successfully';
    ELSE
        RAISE NOTICE 'Services table does not exist. Please run migration 001 first.';
    END IF;
END $$;

-- Add comment (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
    ) THEN
        COMMENT ON COLUMN services.price_krw IS 'Service price in Korean Won (KRW). Drawing consultation: 14,900 KRW (~$14.90 USD)';
    END IF;
END $$;

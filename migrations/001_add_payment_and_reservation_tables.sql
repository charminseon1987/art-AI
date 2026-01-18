-- Migration: Add payment and reservation system tables
-- Created: 2026-01-17
-- Description: Adds tables for services, payments, reservations, phone verification, and user sessions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Service pricing definitions
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price_krw INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial service definitions
INSERT INTO services (service_type, name, price_krw) VALUES
('drawing_consultation', '그림 상담 AI 분석', 990),
('teacher_consultation', '선생님 상담 예약', 50000)
ON CONFLICT (service_type) DO NOTHING;

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,

  -- Portone/Iamport identifiers
  merchant_uid VARCHAR(255) UNIQUE NOT NULL,
  imp_uid VARCHAR(255) UNIQUE,

  -- Payment details
  amount INTEGER NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'full', 'deposit', 'balance'
  payment_method VARCHAR(50), -- 'card', 'vbank', 'trans', etc.
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled', 'refunded'

  -- Portone response data
  portone_response JSONB,

  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_uid ON payments(merchant_uid);
CREATE INDEX IF NOT EXISTS idx_payments_imp_uid ON payments(imp_uid);

-- Teacher consultation reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reservation datetime
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,

  -- Reservation status
  status VARCHAR(50) DEFAULT 'pending_deposit',
  -- Statuses: 'pending_deposit', 'deposit_paid', 'deposit_confirmed', 'in_progress', 'completed', 'cancelled'

  -- Deposit payment (10,000원)
  deposit_amount INTEGER DEFAULT 10000,
  deposit_payment_id UUID REFERENCES payments(id),
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  deposit_confirmed_at TIMESTAMP WITH TIME ZONE,
  deposit_confirmed_by UUID REFERENCES profiles(id), -- Admin who confirmed
  deposit_confirmation_deadline TIMESTAMP WITH TIME ZONE,

  -- Balance payment (40,000원)
  balance_amount INTEGER DEFAULT 40000,
  balance_payment_id UUID REFERENCES payments(id),
  balance_paid_at TIMESTAMP WITH TIME ZONE,

  -- Child and parent information
  child_name VARCHAR(255),
  child_age VARCHAR(50),
  parent_phone VARCHAR(50),
  notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_deposit_deadline ON reservations(deposit_confirmation_deadline);

-- Phone SMS verification
CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_phone_number ON phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_expires ON phone_verifications(expires_at);

-- User sessions for phone authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_session_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON user_sessions(expires_at);

-- Add updated_at trigger for tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

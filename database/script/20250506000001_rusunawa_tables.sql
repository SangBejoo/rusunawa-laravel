-- Simplified PostgreSQL schema for Rusunawa room rental application

-- Enable required extensions for distance calculation
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- CORE USER MANAGEMENT
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- penyewa, admin, wakil_direktorat, super_admin
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TENANT MANAGEMENT
CREATE TABLE tenant_types (
    type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- mahasiswa_putri, mahasiswa_putra, non_mahasiswa
);

-- Insert the tenant types
INSERT INTO tenant_types (type_id, name) VALUES 
    (1, 'mahasiswa'),
    (2, 'non_mahasiswa');

CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES tenant_types(type_id),
    gender CHAR(1) CHECK (gender IN ('L','P')) NOT NULL,
    phone TEXT,
    address TEXT,
    nim TEXT,                         -- Student ID number
    home_latitude NUMERIC(10,7),      -- For distance calculation
    home_longitude NUMERIC(10,7),
    distance_to_campus NUMERIC(10,2), -- in kilometers
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Modify the tenants table to ensure students (mahasiswa) must have a NIM
ALTER TABLE tenants ADD CONSTRAINT check_student_nim CHECK (
    (type_id = 3) OR -- non-mahasiswa doesn't need NIM
    (type_id IN (1, 2) AND nim IS NOT NULL) -- mahasiswa must have NIM
);

-- DOCUMENT MANAGEMENT
CREATE TABLE document_types (
    doc_type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- identity_card, surat_persetujuan, dll.
);

CREATE TABLE tenant_documents (
    doc_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    doc_type_id INTEGER NOT NULL REFERENCES document_types(doc_type_id),
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    status TEXT DEFAULT 'pending',    -- pending, approved, rejected
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, doc_type_id)
);

-- ROOM MANAGEMENT
CREATE TABLE room_classifications (
    classification_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- perempuan, laki_laki, VIP, ruang_rapat
);

CREATE TABLE rental_types (
    rental_type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- harian, bulanan
);

-- Room price configuration
CREATE TABLE room_rates (
    rate_id SERIAL PRIMARY KEY,
    classification_id INTEGER NOT NULL REFERENCES room_classifications(classification_id),
    rental_type_id INTEGER NOT NULL REFERENCES rental_types(rental_type_id),
    rate NUMERIC(12,2) NOT NULL,
    UNIQUE(classification_id, rental_type_id)
);

CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    classification_id INTEGER NOT NULL REFERENCES room_classifications(classification_id),
    rental_type_id INTEGER NOT NULL REFERENCES rental_types(rental_type_id),
    rate_id INTEGER REFERENCES room_rates(rate_id),
    rate NUMERIC(12,2) NOT NULL,     -- Actual rate applied
    capacity INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Room features
CREATE TABLE room_features (
    feature_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE room_amenities (
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    feature_id INTEGER NOT NULL REFERENCES room_features(feature_id),
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (room_id, feature_id)
);

-- Room availability tracking
CREATE TABLE room_availability (
    availability_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(room_id, date)
);

-- BOOKING SYSTEM
CREATE TYPE booking_status AS ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed');

-- Bookings table stores reservation information
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id),    
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,  -- Total booking amount calculated in application logic
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE booking_approvals (
    approval_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(user_id),
    approved BOOLEAN NOT NULL,
    comments TEXT,
    acted_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENT SYSTEM
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- midtrans, manual_upload
);

INSERT INTO payment_methods (name) VALUES ('midtrans'), ('manual_upload');

CREATE TYPE invoice_status AS ENUM('pending', 'paid', 'failed', 'refunded');

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    method_id INTEGER NOT NULL REFERENCES payment_methods(method_id),
    payment_method TEXT DEFAULT 'Bank Transfer',
    invoice_no TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    due_date DATE,
    amount NUMERIC(12,2) NOT NULL,  -- Final billed amount (usually based on booking.total_amount but may include adjustments)
    status invoice_status DEFAULT 'pending',
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENT TRACKING
CREATE TYPE payment_status AS ENUM('pending', 'success', 'failed', 'refunded');

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_channel TEXT,            -- Added column for payment channel (credit_card, bank_transfer, e-wallet, etc)
    payment_url TEXT,                -- Added column for payment receipt or proof screenshot URL
    virtual_account TEXT,            -- Added column for virtual account numbers
    qr_code_url TEXT,                -- Added column for QR code payment URL
    expiry_time TIMESTAMPTZ,         -- Added column for payment expiration time
    provider TEXT,                   -- midtrans, manual, etc.
    transaction_id TEXT,             -- External payment service transaction ID
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,             -- Added column for when payment was confirmed/processed
    metadata JSONB,                  -- Flexible field for additional payment data
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- CAMPUS LOCATIONS
CREATE TABLE campus_locations (
    campus_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- NOTIFICATION SYSTEM
CREATE TABLE notification_types (
    type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    template TEXT NOT NULL,
    channel TEXT NOT NULL   -- email, sms, in_app
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    type_id INTEGER NOT NULL REFERENCES notification_types(type_id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- ISSUE REPORTING
CREATE TYPE issue_status AS ENUM('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE issues (
    issue_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id),
    tenant_id INTEGER REFERENCES tenants(tenant_id),
    reported_by INTEGER NOT NULL REFERENCES users(user_id),
    description TEXT NOT NULL,
    status issue_status DEFAULT 'open',
    reported_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Add a function to calculate distance to campus
CREATE OR REPLACE FUNCTION calculate_distance_to_campus()
RETURNS TRIGGER AS $$
DECLARE
    campus_lat NUMERIC(10,7);
    campus_lon NUMERIC(10,7);
BEGIN
    -- Get the default campus location coordinates
    SELECT latitude, longitude INTO campus_lat, campus_lon
    FROM campus_locations
    WHERE is_default = true
    LIMIT 1;
    
    -- If both tenant coordinates and campus coordinates are available, calculate distance
    IF NEW.home_latitude IS NOT NULL AND NEW.home_longitude IS NOT NULL 
       AND campus_lat IS NOT NULL AND campus_lon IS NOT NULL THEN
        -- Calculate distance using earth_distance (in meters) and convert to kilometers
        NEW.distance_to_campus := earth_distance(
            ll_to_earth(NEW.home_latitude, NEW.home_longitude),
            ll_to_earth(campus_lat, campus_lon)
        ) / 1000;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate distance when a tenant's location is updated
CREATE TRIGGER tenant_location_update
BEFORE INSERT OR UPDATE OF home_latitude, home_longitude ON tenants
FOR EACH ROW EXECUTE FUNCTION calculate_distance_to_campus();

-- Insert default campus location
INSERT INTO campus_locations (name, latitude, longitude, is_default)
VALUES ('Politeknik Negeri Jakarta', -6.371355292523935, 106.82418567314572, true);

-- Insert roles
INSERT INTO roles (name) VALUES
    ('admin'),
    ('user'),
    ('super_admin'),
    ('wakil_direktorat'),
    ('penyewa')
ON CONFLICT (name) DO NOTHING;

-- Insert room classifications
INSERT INTO room_classifications (name) VALUES
    ('perempuan'),
    ('laki_laki'),
    ('VIP'),
    ('ruang_rapat')
ON CONFLICT (name) DO NOTHING;

-- Insert rental types
INSERT INTO rental_types (name) VALUES
    ('harian'),
    ('bulanan')
ON CONFLICT (name) DO NOTHING;

-- Insert standard rates
INSERT INTO room_rates (classification_id, rental_type_id, rate) VALUES
    -- Female students (mahasiswi/perempuan)
    ((SELECT classification_id FROM room_classifications WHERE name = 'perempuan'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan'), 350000),
    ((SELECT classification_id FROM room_classifications WHERE name = 'perempuan'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 100000),
     
    -- Male students (mahasiswa/laki_laki)
    ((SELECT classification_id FROM room_classifications WHERE name = 'laki_laki'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan'), 300000),
    ((SELECT classification_id FROM room_classifications WHERE name = 'laki_laki'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 100000),
     
    -- Non-students (non_mahasiswa)
    ((SELECT classification_id FROM room_classifications WHERE name = 'VIP'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan'), 500000),
    ((SELECT classification_id FROM room_classifications WHERE name = 'VIP'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 150000),
     
    -- Meeting rooms (ruang_rapat)
    ((SELECT classification_id FROM room_classifications WHERE name = 'ruang_rapat'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 500000);

-- Insert room features
INSERT INTO room_features (name, description) VALUES
    ('AC', 'Air Conditioning'),
    ('private_bathroom', 'Private attached bathroom'),
    ('shared_bathroom', 'Shared bathroom'),
    ('single_bed', 'Single bed'),
    ('double_bed', 'Double bed'),
    ('desk', 'Study desk'),
    ('wifi', 'Wi-Fi access'),
    ('wardrobe', 'Clothes wardrobe');

-- Insert document types
INSERT INTO document_types (name) VALUES
    ('identity_card'),
    ('surat_persetujuan'),
    ('bukti_pembayaran'),
    ('formulir_pendaftaran')
ON CONFLICT (name) DO NOTHING;

-- Create initial admin user with password "admin123"
INSERT INTO users (role_id, full_name, email, password_hash, created_at, updated_at)
VALUES (
    (SELECT role_id FROM roles WHERE name = 'admin'),
    'Admin User',
    'admin@rusunawa.com',
    '$2a$10$FgQeMH9May7lkxXYPoDAkOXwCCfa.dO4JrzFmYjS.yxiKi3wMMW4i',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Add midtrans_payment_id column to invoices table

-- Check if the column doesn't exist before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'midtrans_payment_id'
    ) THEN
        -- Add the column with default empty string
        ALTER TABLE invoices ADD COLUMN midtrans_payment_id TEXT DEFAULT '';
    END IF;
END $$;

-- Update existing NULL values to empty string
UPDATE invoices SET midtrans_payment_id = '' WHERE midtrans_payment_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.midtrans_payment_id IS 'Payment transaction ID from Midtrans';

-- Add relationship between invoice and payment
ALTER TABLE invoices ADD COLUMN last_payment_id INTEGER REFERENCES payments(payment_id);

-- Add comment for documentation
COMMENT ON TABLE payments IS 'Tracks individual payment transactions for invoices';

-- Fix receipt_url NULL issue
DO $$
BEGIN
    -- Update existing NULL values to empty string
    UPDATE invoices SET receipt_url = '' WHERE receipt_url IS NULL;
    
    -- Check if the column has a default value, if not, add it
    IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class t ON a.attrelid = t.oid
        JOIN pg_namespace s ON t.relnamespace = s.oid
        JOIN pg_attrdef d ON d.adrelid = t.oid AND d.adnum = a.attnum
        WHERE a.attname = 'receipt_url'
        AND t.relname = 'invoices'
        AND s.nspname = 'public'
    ) THEN
        -- Alter the column to set a default empty string value
        ALTER TABLE invoices ALTER COLUMN receipt_url SET DEFAULT '';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN invoices.receipt_url IS 'URL to payment receipt, defaults to empty string instead of NULL';

-- Fix paid_at NULL issue
DO $$
BEGIN
    -- For invoices without payment, set a minimum date value instead of NULL
    UPDATE invoices 
    SET paid_at = '0001-01-01 00:00:00+00' 
    WHERE paid_at IS NULL;
    
    -- Check if the column has a default value, if not, add it
    IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class t ON a.attrelid = t.oid
        JOIN pg_namespace s ON t.relnamespace = s.oid
        JOIN pg_attrdef d ON d.adrelid = t.oid AND d.adnum = a.attnum
        WHERE a.attname = 'paid_at'
        AND t.relname = 'invoices'
        AND s.nspname = 'public'
    ) THEN
        -- Alter the column to set a default minimum date instead of NULL
        ALTER TABLE invoices ALTER COLUMN paid_at SET DEFAULT '0001-01-01 00:00:00+00';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN invoices.paid_at IS 'When the payment was confirmed, uses minimum date (0001-01-01) if not paid';

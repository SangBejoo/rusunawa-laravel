-- PostgreSQL schema for Rusunawa room rental application

-- Enable required extensions for distance calculation
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Roles for access control
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- penyewa, admin, wakil_direktorat, super_admin
);

-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant classification
CREATE TABLE tenant_types (
    type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- mahasiswa_putri, mahasiswa_putra, non_mahasiswa
);

-- Insert the tenant types with specific IDs to use in constraints
INSERT INTO tenant_types (type_id, name) VALUES 
    (1, 'mahasiswa_putri'),
    (2, 'mahasiswa_putra'),
    (3, 'non_mahasiswa');

-- Tenants profile
CREATE TABLE tenants (
    tenant_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    gender CHAR(1) NOT NULL,
    phone VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES tenant_types(type_id),
    CONSTRAINT check_gender CHECK (gender IN ('L','P'))
);

-- Required document types
CREATE TABLE document_types (
    doc_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE    -- identity_card, surat_persetujuan, dll.
);

-- Tenant uploaded documents (max 4 types)
CREATE TABLE tenant_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    doc_type_id INT NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (doc_type_id) REFERENCES document_types(doc_type_id),
    UNIQUE(tenant_id, doc_type_id)
);

-- Room classifications & rental durations
CREATE TABLE room_classifications (
    classification_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- perempuan, laki_laki, VIP, ruang_rapat
);

CREATE TABLE rental_types (
    rental_type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- harian, bulanan
);

-- Rooms master
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    classification_id INTEGER NOT NULL REFERENCES room_classifications(classification_id),
    rental_type_id INTEGER NOT NULL REFERENCES rental_types(rental_type_id),
    rate NUMERIC(12,2) NOT NULL,
    capacity INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Availability calendar
CREATE TABLE room_availability (
    availability_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(room_id, date)
);

-- Booking status enum
CREATE TYPE booking_status AS ENUM('pending','approved','rejected','cancelled','completed');

-- Confirmed bookings
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id),
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Approval actions
CREATE TABLE booking_approvals (
    approval_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(user_id),
    approved BOOLEAN NOT NULL,
    comments TEXT,
    acted_at TIMESTAMPTZ DEFAULT now()
);

-- Payment methods
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL        -- midtrans, manual_upload
);

-- Insert payment methods
INSERT INTO payment_methods (name) VALUES ('midtrans'), ('manual_upload');

-- Invoices & payment history
CREATE TYPE invoice_status AS ENUM('pending','paid','failed','refunded');
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    method_id INTEGER NOT NULL REFERENCES payment_methods(method_id),
    payment_method TEXT DEFAULT 'Bank Transfer', -- Added payment_method column
    invoice_no TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    due_date DATE,
    amount NUMERIC(12,2) NOT NULL,
    status invoice_status DEFAULT 'pending',
    midtrans_payment_id TEXT,
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add trigger function to keep payment_method in sync with method_id
CREATE OR REPLACE FUNCTION sync_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    SELECT name INTO NEW.payment_method
    FROM payment_methods
    WHERE method_id = NEW.method_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update payment_method
CREATE TRIGGER invoice_payment_method_sync
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION sync_payment_method();

-- Campus location reference points
CREATE TABLE campus_locations (
    campus_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- Add location tracking to tenants
ALTER TABLE tenants ADD COLUMN home_latitude NUMERIC(10,7);
ALTER TABLE tenants ADD COLUMN home_longitude NUMERIC(10,7);
ALTER TABLE tenants ADD COLUMN distance_to_campus NUMERIC(10,2); -- in kilometers
ALTER TABLE tenants ADD COLUMN nim TEXT; -- Add NIM column that was missing

-- Qualification criteria configuration
CREATE TABLE qualification_criteria (
    criteria_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    weight NUMERIC(5,2) NOT NULL, -- importance weight for scoring
    is_active BOOLEAN DEFAULT true
);

-- Insert default qualification criteria
INSERT INTO qualification_criteria (name, description, weight) VALUES
('distance', 'Distance from campus in kilometers', 1.00);

-- Qualification scoring rules table (create this before referencing it)
CREATE TABLE qualification_rules (
    rule_id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES qualification_criteria(criteria_id),
    min_value NUMERIC(10,2),
    max_value NUMERIC(10,2),
    score INTEGER NOT NULL,
    description TEXT
);

-- Insert qualification rules for distance
INSERT INTO qualification_rules (criteria_id, min_value, max_value, score) VALUES
((SELECT criteria_id FROM qualification_criteria WHERE name = 'distance'), 0, 1, 100),
((SELECT criteria_id FROM qualification_criteria WHERE name = 'distance'), 1, 5, 80),
((SELECT criteria_id FROM qualification_criteria WHERE name = 'distance'), 5, 10, 60),
((SELECT criteria_id FROM qualification_criteria WHERE name = 'distance'), 10, 9999, 40);

-- Student qualification results
CREATE TABLE student_qualifications (
    qualification_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id),
    rank INTEGER,
    distance_score NUMERIC(10,2) DEFAULT 0.00,
    total_score NUMERIC(10,2) DEFAULT 0.00,
    qualified BOOLEAN DEFAULT false,
    notes TEXT,
    calculated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Modify the qualification function to calculate score without economic factors
CREATE OR REPLACE FUNCTION calculate_student_qualification(p_tenant_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_distance_score NUMERIC;
    v_total_score NUMERIC(5,2);
    v_distance NUMERIC;
    v_is_student BOOLEAN;
    v_weight_distance NUMERIC;
BEGIN
    -- Check if tenant is a student
    SELECT EXISTS (
        SELECT 1 FROM tenants t
        JOIN tenant_types tt ON t.type_id = tt.type_id
        WHERE t.tenant_id = p_tenant_id
        AND tt.name IN ('mahasiswa_putra', 'mahasiswa_putri')
    ) INTO v_is_student;
    
    -- If not a student, assign maximum score
    IF NOT v_is_student THEN
        RETURN 10.0;
    END IF;

    -- Get tenant's distance to campus
    SELECT distance_to_campus INTO v_distance
    FROM tenants
    WHERE tenant_id = p_tenant_id;
    
    -- If distance data is not available, return minimum score
    IF v_distance IS NULL THEN
        RETURN 0.0;
    END IF;
    
    -- Get weight for distance criterion
    SELECT weight INTO v_weight_distance 
    FROM qualification_criteria 
    WHERE name = 'distance' AND is_active = true;
    
    -- Calculate distance score
    SELECT score INTO v_distance_score
    FROM qualification_rules
    WHERE criteria_id = (SELECT criteria_id FROM qualification_criteria WHERE name = 'distance')
    AND v_distance BETWEEN min_value AND max_value;
    
    -- If no rule matches (shouldn't happen with our ranges), use minimum score
    IF v_distance_score IS NULL THEN
        v_distance_score := 40;
    END IF;
    
    -- Calculate total score (just the distance score weighted)
    v_total_score := v_distance_score * COALESCE(v_weight_distance, 1.0);
    
    -- Save qualification results
    INSERT INTO student_qualifications 
    (tenant_id, distance_score, total_score, notes, calculated_at)
    VALUES 
    (p_tenant_id, v_distance_score, v_total_score,
     'Distance: ' || v_distance || ' km', now())
    ON CONFLICT (tenant_id) 
    DO UPDATE SET 
        distance_score = EXCLUDED.distance_score,
        total_score = EXCLUDED.total_score,
        notes = EXCLUDED.notes,
        calculated_at = EXCLUDED.calculated_at;
    
    -- Update ranks
    WITH ranked_students AS (
        SELECT sq.tenant_id, 
               ROW_NUMBER() OVER (ORDER BY sq.total_score DESC) AS new_rank
        FROM student_qualifications sq
    )
    UPDATE student_qualifications sq
    SET rank = rs.new_rank,
        qualified = (rs.new_rank <= 10)  -- Example: top 10 are qualified
    FROM ranked_students rs
    WHERE sq.tenant_id = rs.tenant_id;
    
    -- Return the score
    RETURN v_total_score;
END;
$$ LANGUAGE plpgsql;

-- Create a view specifically for distance-based qualification
CREATE OR REPLACE VIEW distance_qualification_view AS
SELECT 
    sq.qualification_id,
    sq.rank,
    sq.distance_score AS score,
    sq.qualified,
    t.tenant_id,
    u.full_name,
    t.gender,
    t.distance_to_campus,
    tt.name AS tenant_type,
    (SELECT COUNT(*) FROM student_qualifications) AS total_students
FROM student_qualifications sq
JOIN tenants t ON sq.tenant_id = t.tenant_id
JOIN users u ON t.user_id = u.user_id
JOIN tenant_types tt ON t.type_id = tt.type_id
ORDER BY sq.rank;

-- Payment status enum
CREATE TYPE payment_status AS ENUM('pending','success','failed','expired','refunded');

-- Payment transactions table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_channel TEXT,            -- e.g., BCA, Mandiri, DANA, etc.
    transaction_id TEXT UNIQUE,      -- ID from payment gateway
    status payment_status DEFAULT 'pending',
    payment_url TEXT,                -- URL for payment gateway redirect
    virtual_account TEXT,            -- For bank transfers
    qr_code_url TEXT,                -- For QR-based payments
    expiry_time TIMESTAMPTZ,         -- Payment expiration
    paid_at TIMESTAMPTZ,             -- When payment was confirmed
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Trigger function to update invoice status when payment is successful
CREATE OR REPLACE FUNCTION update_invoice_on_payment() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update invoice status when payment is marked as successful
    IF NEW.status = 'success' AND OLD.status != 'success' THEN
        UPDATE invoices 
        SET status = 'paid', 
            paid_at = NEW.paid_at, 
            midtrans_payment_id = NEW.transaction_id
        WHERE invoice_id = NEW.invoice_id;
    END IF;
    
    -- Reset invoice to pending if payment fails or expires
    IF (NEW.status = 'failed' OR NEW.status = 'expired') AND 
       OLD.status != NEW.status AND
       OLD.status != 'success' THEN
        
        UPDATE invoices 
        SET status = 'pending', 
            paid_at = NULL, 
            midtrans_payment_id = NULL
        WHERE invoice_id = NEW.invoice_id 
        AND status != 'paid';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update invoice when payment status changes
CREATE TRIGGER payment_status_change
AFTER UPDATE OF status ON payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_on_payment();

-- Issue reporting
CREATE TYPE issue_status AS ENUM('open','in_progress','resolved','closed');
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

-- Policy agreements
CREATE TABLE policy_agreements (
    agreement_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    policy_id TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(tenant_id, policy_id, policy_version)
);

-- Fixed room rates based on classification and rental type
CREATE TABLE room_rates (
    rate_id SERIAL PRIMARY KEY,
    classification_id INTEGER NOT NULL REFERENCES room_classifications(classification_id),
    rental_type_id INTEGER NOT NULL REFERENCES rental_types(rental_type_id),
    rate NUMERIC(12,2) NOT NULL,
    UNIQUE(classification_id, rental_type_id)
);

-- Insert standard rates
INSERT INTO room_classifications (name) VALUES 
    ('perempuan'), ('laki_laki'), ('non_mahasiswa'), ('ruang_rapat');

INSERT INTO rental_types (name) VALUES 
    ('harian'), ('bulanan');

-- Insert fixed prices according to requirements
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
    ((SELECT classification_id FROM room_classifications WHERE name = 'non_mahasiswa'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan'), 500000),
    ((SELECT classification_id FROM room_classifications WHERE name = 'non_mahasiswa'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 150000),
     
    -- Meeting rooms (ruang_rapat) - daily only
    ((SELECT classification_id FROM room_classifications WHERE name = 'ruang_rapat'), 
     (SELECT rental_type_id FROM rental_types WHERE name = 'harian'), 500000);

-- Modify room rates column to be based on the fixed pricing
ALTER TABLE rooms ADD COLUMN rate_id INTEGER REFERENCES room_rates(rate_id);

-- Add triggers to automatically set the rate based on classification and rental type
CREATE OR REPLACE FUNCTION sync_room_rate()
RETURNS TRIGGER AS $$
DECLARE
    matching_rate_id INTEGER;
BEGIN
    -- Find the appropriate rate_id based on classification and rental type
    SELECT rate_id INTO matching_rate_id
    FROM room_rates
    WHERE classification_id = NEW.classification_id AND rental_type_id = NEW.rental_type_id;
    
    -- Set the rate_id and the actual rate value
    IF matching_rate_id IS NOT NULL THEN
        NEW.rate_id := matching_rate_id;
        
        -- Also update the rate field for backward compatibility
        SELECT rate INTO NEW.rate
        FROM room_rates
        WHERE rate_id = matching_rate_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set the rate_id and rate value
CREATE TRIGGER room_rate_sync
BEFORE INSERT OR UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION sync_room_rate();

-- Create a validation trigger to prevent setting rates that don't match fixed pricing
-- Modified to update the rate instead of raising an exception
CREATE OR REPLACE FUNCTION validate_room_rate()
RETURNS TRIGGER AS $$
DECLARE
    expected_rate NUMERIC(12,2);
BEGIN
    -- Find the expected rate based on classification and rental type
    SELECT rate INTO expected_rate
    FROM room_rates
    WHERE classification_id = NEW.classification_id AND rental_type_id = NEW.rental_type_id;
    
    -- If no rate found, use a default based on type
    IF expected_rate IS NULL THEN
        CASE 
            WHEN NEW.rental_type_id = (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan') THEN
                NEW.rate := 350000; -- Default monthly rate
            ELSE
                NEW.rate := 100000; -- Default daily rate
        END CASE;
        RETURN NEW;
    END IF;
    
    -- Validate that the rate matches the expected value
    IF NEW.rate != expected_rate THEN
        -- Update the rate to match the fixed rate instead of raising an error
        NEW.rate := expected_rate;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a safety check to handle potential missing room_rates table when querying
CREATE OR REPLACE FUNCTION get_room_rate(
    p_classification_id INTEGER, 
    p_rental_type_id INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    v_rate NUMERIC(12,2);
BEGIN
    -- Check if table exists first to avoid errors
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'room_rates') THEN
        SELECT rate INTO v_rate
        FROM room_rates
        WHERE classification_id = p_classification_id 
        AND rental_type_id = p_rental_type_id;
        
        IF v_rate IS NOT NULL THEN
            RETURN v_rate;
        END IF;
    END IF;
    
    -- Default rates as fallback
    IF p_rental_type_id = (SELECT rental_type_id FROM rental_types WHERE name = 'bulanan') THEN
        RETURN 350000; -- Default monthly rate
    ELSE
        RETURN 100000; -- Default daily rate
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add an additional safety measure to ensure consistency in the rooms table data
DO $$
BEGIN
    -- Only run if the room_rates table exists but we have inconsistent data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'room_rates') THEN
        -- Update any existing rooms to use the correct rate from room_rates if rate_id is null
        UPDATE rooms r
        SET rate = rr.rate, 
            rate_id = rr.rate_id
        FROM room_rates rr
        WHERE r.classification_id = rr.classification_id 
        AND r.rental_type_id = rr.rental_type_id
        AND (r.rate_id IS NULL OR r.rate != rr.rate);
    END IF;
END $$;

-- Make sure all the required classes and types exist
DO $$
BEGIN
    -- Insert if not exists
    INSERT INTO room_classifications (name) 
    SELECT 'perempuan' WHERE NOT EXISTS (SELECT 1 FROM room_classifications WHERE name = 'perempuan');

    INSERT INTO room_classifications (name) 
    SELECT 'laki_laki' WHERE NOT EXISTS (SELECT 1 FROM room_classifications WHERE name = 'laki_laki');

    INSERT INTO room_classifications (name) 
    SELECT 'non_mahasiswa' WHERE NOT EXISTS (SELECT 1 FROM room_classifications WHERE name = 'non_mahasiswa');

    INSERT INTO room_classifications (name) 
    SELECT 'ruang_rapat' WHERE NOT EXISTS (SELECT 1 FROM room_classifications WHERE name = 'ruang_rapat');

    INSERT INTO rental_types (name) 
    SELECT 'harian' WHERE NOT EXISTS (SELECT 1 FROM rental_types WHERE name = 'harian');

    INSERT INTO rental_types (name) 
    SELECT 'bulanan' WHERE NOT EXISTS (SELECT 1 FROM rental_types WHERE name = 'bulanan');
END $$;

-- Insert default campus location with the correct coordinates
UPDATE campus_locations 
SET latitude = -6.371355292523935, longitude = 106.82418567314572
WHERE is_default = true;

-- If no record exists yet, insert it
INSERT INTO campus_locations (name, latitude, longitude, is_default)
SELECT 'Politeknik Negeri Jakarta', -6.371355292523935, 106.82418567314572, true
WHERE NOT EXISTS (SELECT 1 FROM campus_locations WHERE is_default = true);

-- NOTIFICATIONS SYSTEM
CREATE TABLE notification_types (
    type_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    template TEXT NOT NULL, -- Template with placeholders
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

-- Insert common notification types
INSERT INTO notification_types (name, template, channel) VALUES
('booking_created', 'Your booking #{booking_id} has been created and is pending approval.', 'email'),
('booking_approved', 'Your booking #{booking_id} has been approved. Please complete payment.', 'email'),
('booking_rejected', 'Unfortunately, your booking #{booking_id} has been rejected: {reason}', 'email'),
('payment_received', 'We have received your payment for invoice #{invoice_no}.', 'email'),
('qualification_result', 'Your qualification score is {score} with rank #{rank} out of {total}.', 'email'),
('document_approved', 'Your document {document_name} has been approved.', 'email'),
('document_rejected', 'Your document {document_name} has been rejected: {reason}', 'email');

-- WAITING LIST FOR QUALIFIED STUDENTS
CREATE TABLE waiting_list (
    waiting_id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id),
    rank INTEGER NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting', -- waiting, allocated, expired, cancelled
    notes TEXT,
    UNIQUE(tenant_id, requested_at)
);

-- Function to update waiting list based on current rankings
CREATE OR REPLACE FUNCTION update_waiting_list()
RETURNS VOID AS $$
BEGIN
    -- Update ranks for existing waiting list entries
    UPDATE waiting_list w
    SET rank = sq.rank
    FROM student_qualifications sq
    WHERE w.tenant_id = sq.tenant_id
    AND w.status = 'waiting';
    
    -- Order the waiting list by rank
    UPDATE waiting_list
    SET rank = subquery.new_rank
    FROM (
        SELECT 
            waiting_id,
            ROW_NUMBER() OVER (ORDER BY rank) AS new_rank
        FROM waiting_list
        WHERE status = 'waiting'
    ) AS subquery
    WHERE waiting_list.waiting_id = subquery.waiting_id;
END;
$$ LANGUAGE plpgsql;

-- ROOM FEATURES & AMENITIES
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

-- Insert common room features
INSERT INTO room_features (name, description) VALUES
('AC', 'Air Conditioning'),
('private_bathroom', 'Private attached bathroom'),
('shared_bathroom', 'Shared bathroom'),
('single_bed', 'Single bed'),
('double_bed', 'Double bed'),
('desk', 'Study desk'),
('wifi', 'Wi-Fi access'),
('wardrobe', 'Clothes wardrobe');


-- BOOKING VALIDATION BASED ON QUALIFICATION REQUIREMENTS
-- Add a trigger to prevent students from booking if they don't meet ranking criteria
CREATE OR REPLACE FUNCTION validate_student_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_is_student BOOLEAN;
    v_is_eligible BOOLEAN;
    v_tenant_type TEXT;
    v_room_class TEXT;
BEGIN
    -- Check if tenant is a student
    SELECT tt.name INTO v_tenant_type
    FROM tenants t
    JOIN tenant_types tt ON t.type_id = tt.type_id
    WHERE t.tenant_id = NEW.tenant_id;
    
    -- If not a student, allow booking without qualification check
    IF v_tenant_type NOT IN ('mahasiswa_putra', 'mahasiswa_putri') THEN
        RETURN NEW;
    END IF;
    
    -- Get room classification
    SELECT rc.name INTO v_room_class
    FROM rooms r
    JOIN room_classifications rc ON r.classification_id = rc.classification_id
    WHERE r.room_id = NEW.room_id;
    
    -- Check if room is appropriate for gender
    IF (v_tenant_type = 'mahasiswa_putra' AND v_room_class = 'perempuan') OR
       (v_tenant_type = 'mahasiswa_putri' AND v_room_class = 'laki_laki') THEN
        RAISE EXCEPTION 'Room gender classification does not match tenant gender';
    END IF;
    
    -- Check eligibility based on qualification ranking
    SELECT is_student_eligible_for_booking(NEW.tenant_id) INTO v_is_eligible;
    
    IF NOT v_is_eligible THEN
        -- Add to waiting list instead of raising exception
        INSERT INTO waiting_list (tenant_id, rank, notes)
        SELECT 
            NEW.tenant_id, 
            COALESCE((SELECT rank FROM student_qualifications WHERE tenant_id = NEW.tenant_id), 9999),
            'Added to waiting list due to ranking ineligibility';
            
        RAISE EXCEPTION 'Student does not meet qualification criteria. Added to waiting list.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_student_validation
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION validate_student_booking();

-- ROOM AVAILABILITY TRACKING IMPROVEMENT
-- Automatically update room availability based on confirmed bookings
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
DECLARE
    curr_date DATE;
BEGIN
    -- If booking is approved, mark dates as unavailable
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        curr_date := NEW.check_in;
        WHILE curr_date <= NEW.check_out LOOP
            -- Insert or update availability
            INSERT INTO room_availability (room_id, date, is_available)
            VALUES (NEW.room_id, curr_date, false)
            ON CONFLICT (room_id, date) 
            DO UPDATE SET is_available = false;
            
            curr_date := curr_date + INTERVAL '1 day';
        END LOOP;
    
    -- If booking is cancelled/rejected, mark dates as available again
    ELSIF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND 
          OLD.status = 'approved' THEN
        curr_date := NEW.check_in;
        WHILE curr_date <= NEW.check_out LOOP
            -- Check if date is booked by any other approved booking
            IF NOT EXISTS (
                SELECT 1 FROM bookings 
                WHERE room_id = NEW.room_id 
                AND booking_id != NEW.booking_id
                AND status = 'approved'
                AND check_in <= curr_date AND check_out >= curr_date
            ) THEN
                -- Make date available again
                UPDATE room_availability
                SET is_available = true
                WHERE room_id = NEW.room_id AND date = curr_date;
            END IF;
            
            curr_date := curr_date + INTERVAL '1 day';
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_update_availability
AFTER INSERT OR UPDATE OF status ON bookings
FOR EACH ROW EXECUTE FUNCTION update_room_availability();

-- DASHBOARD STATISTICS FUNCTIONS
CREATE OR REPLACE FUNCTION get_occupancy_statistics(start_date DATE, end_date DATE)
RETURNS TABLE (
    date DATE,
    total_rooms INTEGER,
    occupied_rooms INTEGER,
    occupancy_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
    ),
    room_counts AS (
        SELECT COUNT(DISTINCT room_id) AS total_rooms FROM rooms
    ),
    occupied AS (
        SELECT 
            d.date,
            COUNT(DISTINCT ra.room_id) AS occupied_rooms
        FROM dates d
        CROSS JOIN room_counts
        LEFT JOIN room_availability ra ON ra.date = d.date AND ra.is_available = false
        GROUP BY d.date
    )
    SELECT 
        o.date,
        rc.total_rooms,
        o.occupied_rooms,
        ROUND((o.occupied_rooms::numeric / rc.total_rooms) * 100, 2) AS occupancy_rate
    FROM occupied o
    CROSS JOIN room_counts rc
    ORDER BY o.date;
END;
$$ LANGUAGE plpgsql;

-- Student quota management
CREATE TABLE student_quota (
    quota_id SERIAL PRIMARY KEY,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    male_quota INTEGER NOT NULL,
    female_quota INTEGER NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(academic_year, semester)
);

-- Function to check remaining quota
CREATE OR REPLACE FUNCTION get_remaining_quota(p_academic_year TEXT, p_semester TEXT)
RETURNS TABLE (
    male_total INTEGER,
    male_used INTEGER,
    male_remaining INTEGER,
    female_total INTEGER,
    female_used INTEGER,
    female_remaining INTEGER
) AS $$
DECLARE
    v_male_quota INTEGER;
    v_female_quota INTEGER;
    v_male_used INTEGER;
    v_female_used INTEGER;
    v_current_date DATE := CURRENT_DATE;
BEGIN
    -- Get quota
    SELECT male_quota, female_quota INTO v_male_quota, v_female_quota
    FROM student_quota
    WHERE academic_year = p_academic_year 
    AND semester = p_semester
    AND v_current_date BETWEEN effective_from AND effective_to;
    
    -- Count used quota (active bookings for students)
    SELECT COUNT(*) INTO v_male_used
    FROM bookings b
    JOIN tenants t ON b.tenant_id = t.tenant_id
    JOIN tenant_types tt ON t.type_id = tt.type_id
    WHERE tt.name = 'mahasiswa_putra'
    AND b.status = 'approved'
    AND v_current_date BETWEEN b.check_in AND b.check_out;
    
    SELECT COUNT(*) INTO v_female_used
    FROM bookings b
    JOIN tenants t ON b.tenant_id = t.tenant_id
    JOIN tenant_types tt ON t.type_id = tt.type_id
    WHERE tt.name = 'mahasiswa_putri'
    AND b.status = 'approved'
    AND v_current_date BETWEEN b.check_in AND b.check_out;
    
    -- Return results
    RETURN QUERY
    SELECT 
        COALESCE(v_male_quota, 0),
        COALESCE(v_male_used, 0),
        COALESCE(v_male_quota, 0) - COALESCE(v_male_used, 0),
        COALESCE(v_female_quota, 0),
        COALESCE(v_female_used, 0),
        COALESCE(v_female_quota, 0) - COALESCE(v_female_used, 0);
END;
$$ LANGUAGE plpgsql;


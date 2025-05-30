-- Simplified MySQL schema for Rusunawa room rental application

-- CORE USER MANAGEMENT
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- penyewa, admin, wakil_direktorat, super_admin
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- TENANT MANAGEMENT
CREATE TABLE tenant_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- mahasiswa_putri, mahasiswa_putra, non_mahasiswa
);

-- Insert the tenant types
INSERT IGNORE INTO tenant_types (type_id, name) VALUES 
    (1, 'mahasiswa_putri'),
    (2, 'mahasiswa_putra'),
    (3, 'non_mahasiswa');

CREATE TABLE tenants (
    tenant_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    gender CHAR(1) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    nim VARCHAR(50),                         -- Student ID number
    home_latitude DECIMAL(10,7),      -- For distance calculation
    home_longitude DECIMAL(10,7),
    distance_to_campus DECIMAL(10,2), -- in kilometers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES tenant_types(type_id),
    CHECK (
        (type_id = 3) OR -- non-mahasiswa doesn't need NIM
        (type_id IN (1, 2) AND nim IS NOT NULL)
    ),
    CHECK (gender IN ('L','P'))
);

-- DOCUMENT MANAGEMENT
CREATE TABLE document_types (
    doc_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- identity_card, surat_persetujuan, dll.
);

CREATE TABLE tenant_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    doc_type_id INT NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',    -- pending, approved, rejected
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, doc_type_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (doc_type_id) REFERENCES document_types(doc_type_id)
);

-- ROOM MANAGEMENT
CREATE TABLE room_classifications (
    classification_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- perempuan, laki_laki, VIP, ruang_rapat
);

CREATE TABLE rental_types (
    rental_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- harian, bulanan
);

-- Room price configuration
CREATE TABLE room_rates (
    rate_id INT AUTO_INCREMENT PRIMARY KEY,
    classification_id INT NOT NULL,
    rental_type_id INT NOT NULL,
    rate DECIMAL(12,2) NOT NULL,
    UNIQUE(classification_id, rental_type_id),
    FOREIGN KEY (classification_id) REFERENCES room_classifications(classification_id),
    FOREIGN KEY (rental_type_id) REFERENCES rental_types(rental_type_id)
);

CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    classification_id INT NOT NULL,
    rental_type_id INT NOT NULL,
    rate_id INT,
    rate DECIMAL(12,2) NOT NULL,     -- Actual rate applied
    capacity INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classification_id) REFERENCES room_classifications(classification_id),
    FOREIGN KEY (rental_type_id) REFERENCES rental_types(rental_type_id),
    FOREIGN KEY (rate_id) REFERENCES room_rates(rate_id)
);

-- Room features
CREATE TABLE room_features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE room_amenities (
    room_id INT NOT NULL,
    feature_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (room_id, feature_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (feature_id) REFERENCES room_features(feature_id)
);

-- Room availability tracking
CREATE TABLE room_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE(room_id, date),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- BOOKING SYSTEM
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

CREATE TABLE booking_approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    approver_id INT NOT NULL,
    approved TINYINT(1) NOT NULL,
    comments TEXT,
    acted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(user_id)
);

-- PAYMENT SYSTEM
CREATE TABLE payment_methods (
    method_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL        -- midtrans, manual_upload
);

INSERT IGNORE INTO payment_methods (name) VALUES ('midtrans'), ('manual_upload');

CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    method_id INT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    receipt_url TEXT,
    paid_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    midtrans_payment_id VARCHAR(100) COMMENT 'Payment transaction ID from Midtrans',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (method_id) REFERENCES payment_methods(method_id)
);

-- CAMPUS LOCATIONS
CREATE TABLE campus_locations (
    campus_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    is_default TINYINT(1) DEFAULT 0
);

-- NOTIFICATION SYSTEM
CREATE TABLE notification_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    template TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL   -- email, sms, in_app
);

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (type_id) REFERENCES notification_types(type_id)
);

-- ISSUE REPORTING
CREATE TABLE issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    tenant_id INT,
    reported_by INT NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id)
);

-- Insert default campus location
INSERT IGNORE INTO campus_locations (name, latitude, longitude, is_default)
VALUES ('Politeknik Negeri Jakarta', -6.3713553, 106.8241857, 1);

-- Insert roles
INSERT IGNORE INTO roles (name) VALUES
    ('admin'),
    ('user'),
    ('super_admin'),
    ('wakil_direktorat'),
    ('penyewa');

-- Insert room classifications
INSERT IGNORE INTO room_classifications (name) VALUES
    ('perempuan'),
    ('laki_laki'),
    ('VIP'),
    ('ruang_rapat');

-- Insert rental types
INSERT IGNORE INTO rental_types (name) VALUES
    ('harian'),
    ('bulanan');

-- Insert standard rates
INSERT IGNORE INTO room_rates (classification_id, rental_type_id, rate) VALUES
    (1, 2, 350000),
    (1, 1, 100000),
    (2, 2, 300000),
    (2, 1, 100000),
    (3, 2, 500000),
    (3, 1, 150000),
    (4, 1, 500000);

-- Insert room features
INSERT IGNORE INTO room_features (name, description) VALUES
    ('AC', 'Air Conditioning'),
    ('private_bathroom', 'Private attached bathroom'),
    ('shared_bathroom', 'Shared bathroom'),
    ('single_bed', 'Single bed'),
    ('double_bed', 'Double bed'),
    ('desk', 'Study desk'),
    ('wifi', 'Wi-Fi access'),
    ('wardrobe', 'Clothes wardrobe');

-- Insert document types
INSERT IGNORE INTO document_types (name) VALUES
    ('identity_card'),
    ('surat_persetujuan'),
    ('bukti_pembayaran'),
    ('formulir_pendaftaran');

-- Create initial admin user with password "admin123"
INSERT IGNORE INTO users (role_id, full_name, email, password_hash, created_at, updated_at)
VALUES (
    1,
    'Admin User',
    'admin@rusunawa.com',
    '$2a$10$FgQeMH9May7lkxXYPoDAkOXwCCfa.dO4JrzFmYjS.yxiKi3wMMW4i',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

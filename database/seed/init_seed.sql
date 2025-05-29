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

-- Insert document types
INSERT IGNORE INTO document_types (name) VALUES
    ('identity_card'),
    ('surat_persetujuan'),
    ('bukti_pembayaran'),
    ('formulir_pendaftaran');

-- Create initial admin user with password "admin123"
INSERT IGNORE INTO users (role_id, full_name, email, password_hash, created_at, updated_at)
VALUES (
    (SELECT role_id FROM roles WHERE name = 'admin'),
    'Admin User',
    'admin@rusunawa.com',
    '$2a$10$FgQeMH9May7lkxXYPoDAkOXwCCfa.dO4JrzFmYjS.yxiKi3wMMW4i',
    NOW(),
    NOW()
);

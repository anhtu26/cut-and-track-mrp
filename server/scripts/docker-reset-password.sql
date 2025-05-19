-- Reset admin password script
-- This will update the password_hash for the admin user

-- Update admin user password hash to a known value for 'admin123'
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=1$+P2afko+hpX5+zZ+YqZ2CQ$VL4oa3bFV+IXPaPOr9TFwplFr64NpCBqA7tj1B4fPNY'
WHERE email = 'admin@example.com';

-- Update manager user password hash
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=1$+P2afko+hpX5+zZ+YqZ2CQ$VL4oa3bFV+IXPaPOr9TFwplFr64NpCBqA7tj1B4fPNY'
WHERE email = 'manager@example.com';

-- Update operator user password hash
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=1$+P2afko+hpX5+zZ+YqZ2CQ$VL4oa3bFV+IXPaPOr9TFwplFr64NpCBqA7tj1B4fPNY'
WHERE email = 'operator@example.com';

-- Verify the updates
SELECT email, role, substring(password_hash, 1, 50) || '...' as password_hash_preview
FROM users
WHERE email IN ('admin@example.com', 'manager@example.com', 'operator@example.com');

-- Update password hashes for authentication system
-- This updates the password hashes to match the expected passwords
-- The password for all users is 'admin123'

-- Update admin user password hash
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

-- Initialize Admin User
-- This script creates or updates the admin user with the correct role and password

-- Check if admin user exists
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@example.com') INTO admin_exists;
    
    IF admin_exists THEN
        -- Update existing admin user
        UPDATE users 
        SET role = 'Administrator',
            password_hash = '$argon2id$v=19$m=65536,t=3,p=1$SaltSaltSaltSaltSaltSalt$HashHashHashHashHashHashHashHash',
            first_name = 'Admin',
            last_name = 'User'
        WHERE email = 'admin@example.com';
        
        RAISE NOTICE 'Admin user updated successfully';
    ELSE
        -- Create new admin user
        INSERT INTO users (id, email, password_hash, role, first_name, last_name)
        VALUES (
            uuid_generate_v4(),
            'admin@example.com',
            '$argon2id$v=19$m=65536,t=3,p=1$SaltSaltSaltSaltSaltSalt$HashHashHashHashHashHashHashHash',
            'Administrator',
            'Admin',
            'User'
        );
        
        RAISE NOTICE 'Admin user created successfully';
    END IF;
END $$;

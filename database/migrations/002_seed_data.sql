-- Seed data for development and testing
-- This script adds initial test data to the database

-- Add admin user (password is 'admin123' - using argon2 hashing for ITAR-compliant local authentication)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES 
  ('admin@example.com', '$argon2id$v=19$m=65536,t=3,p=1$NXc5UHFmVDRZY0JodGRGSA$KCQXCwlxMhXEH5QcIZ0RGGaR9mY0xKsqwoGJVSl9/Hs', 'Admin', 'User', 'admin'),
  ('manager@example.com', '$argon2id$v=19$m=65536,t=3,p=1$NXc5UHFmVDRZY0JodGRGSA$KCQXCwlxMhXEH5QcIZ0RGGaR9mY0xKsqwoGJVSl9/Hs', 'Manager', 'User', 'manager'),
  ('operator@example.com', '$argon2id$v=19$m=65536,t=3,p=1$NXc5UHFmVDRZY0JodGRGSA$KCQXCwlxMhXEH5QcIZ0RGGaR9mY0xKsqwoGJVSl9/Hs', 'Operator', 'User', 'operator');

-- Add customers
INSERT INTO customers (id, name, contact_name, contact_email, contact_phone, address)
VALUES 
  ('e8fd159b-57c4-4d36-9bd7-a59ca13057bb', 'Airo Defense Systems', 'John Smith', 'john@airodefense.com', '555-123-4567', '123 Aviation Blvd, Seattle, WA 98101'),
  ('c3a7a8d9-d3f0-4c2b-9f6a-b9c5e2d1c8e7', 'Precision Hydraulics', 'Emma Johnson', 'emma@precisionhyd.com', '555-234-5678', '456 Industrial Way, Portland, OR 97201'),
  ('b2c1d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'TechMach Industries', 'Robert Chen', 'robert@techmach.com', '555-345-6789', '789 Tech Drive, San Jose, CA 95123'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Aerospace Specialties', 'Sarah Williams', 'sarah@aerospecs.com', '555-456-7890', '321 Flight Path, Los Angeles, CA 90045');

-- Add parts
INSERT INTO parts (id, part_number, name, description, material, drawing_number, revision, unit_price, customer_id)
VALUES 
  ('f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'AP-1001', 'Hydraulic Manifold', 'High-pressure hydraulic manifold for aircraft systems', 'Aluminum 6061', 'DWG-1001', 'A', 450.00, 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'),
  ('e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'TM-500', 'Precision Shaft', 'High tolerance shaft for industrial machinery', 'Stainless Steel 304', 'DWG-500', 'C', 175.50, 'b2c1d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'),
  ('d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'PH-750', 'Bearing Housing', 'Precision bearing housing for hydraulic systems', 'Stainless Steel 316', 'DWG-750', 'B', 325.75, 'c3a7a8d9-d3f0-4c2b-9f6a-b9c5e2d1c8e7'),
  ('c4b5a6f7-e8d9-0c1b-2a3c-4d5e6f7a8b9c', 'AS-2200', 'Custom Flange', 'Specialized mounting flange for aerospace applications', 'Titanium 6Al-4V', 'DWG-2200', 'D', 620.00, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

-- Add work orders
INSERT INTO work_orders (id, order_number, status, priority, customer_id, part_id, quantity, due_date, start_date, notes)
VALUES 
  ('abcd1234-5678-90ab-cdef-1234567890ab', 'WO-2025-001', 'in_progress', 'high', 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb', 'f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 5, CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Customer requires expedited delivery'),
  ('bcde2345-6789-01bc-defa-2345678901bc', 'WO-2025-002', 'pending', 'medium', 'b2c1d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 10, CURRENT_TIMESTAMP + INTERVAL '14 days', NULL, 'Standard order for regular customer'),
  ('cdef3456-7890-12cd-efab-3456789012cd', 'WO-2025-003', 'completed', 'medium', 'c3a7a8d9-d3f0-4c2b-9f6a-b9c5e2d1c8e7', 'd3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 3, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Completed ahead of schedule'),
  ('def04567-8901-23de-fabc-4567890123de', 'WO-2025-004', 'on_hold', 'low', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'c4b5a6f7-e8d9-0c1b-2a3c-4d5e6f7a8b9c', 1, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '1 day', 'On hold pending customer review of material change');

-- Add operations for work orders
INSERT INTO operations (work_order_id, name, description, status, machine, setup_time_hours, duration_hours, actual_duration_hours, sequence_number, assigned_to)
VALUES
  ('abcd1234-5678-90ab-cdef-1234567890ab', 'CNC Milling', 'Initial machining of hydraulic manifold', 'completed', 'HAAS VF-2', 1.5, 3.0, 2.75, 1, (SELECT id FROM users WHERE email = 'operator@example.com')),
  ('abcd1234-5678-90ab-cdef-1234567890ab', 'Deburring', 'Remove burrs and sharp edges', 'in_progress', NULL, 0.5, 1.0, NULL, 2, (SELECT id FROM users WHERE email = 'operator@example.com')),
  ('abcd1234-5678-90ab-cdef-1234567890ab', 'Quality Inspection', 'Final inspection of parts', 'pending', NULL, 0.0, 0.5, NULL, 3, NULL),
  
  ('bcde2345-6789-01bc-defa-2345678901bc', 'CNC Turning', 'Precision shaft turning operation', 'pending', 'DMG MORI NLX 2500', 1.0, 2.0, NULL, 1, NULL),
  ('bcde2345-6789-01bc-defa-2345678901bc', 'Grinding', 'Surface grinding to tolerance', 'pending', 'Okamoto Grinder', 0.5, 1.5, NULL, 2, NULL),
  
  ('cdef3456-7890-12cd-efab-3456789012cd', 'CNC Machining', 'Housing machining', 'completed', 'DMG MORI DMU 50', 1.0, 2.5, 2.6, 1, (SELECT id FROM users WHERE email = 'operator@example.com')),
  ('cdef3456-7890-12cd-efab-3456789012cd', 'Inspection', 'Quality control inspection', 'completed', NULL, 0.0, 0.5, 0.4, 2, (SELECT id FROM users WHERE email = 'manager@example.com')),
  
  ('def04567-8901-23de-fabc-4567890123de', 'Material Prep', 'Titanium material preparation', 'completed', NULL, 0.5, 1.0, 1.1, 1, (SELECT id FROM users WHERE email = 'operator@example.com')),
  ('def04567-8901-23de-fabc-4567890123de', 'CNC Machining', 'Flange machining', 'on_hold', 'HAAS UMC-750', 2.0, 4.0, NULL, 2, (SELECT id FROM users WHERE email = 'operator@example.com'));

-- ===================================
-- MESH DEMO DATA - WORKBENCH INSERT
-- ===================================
-- Run this entire script in MySQL Workbench
-- Steps:
-- 1. Create database first: CREATE DATABASE task_platform;
-- 2. Run: USE task_platform;
-- 3. Run the schema from task_platform_db.session.sql
-- 4. Then run this script

-- ===================================
-- AREAS
-- ===================================
INSERT INTO Area (pincode, locality, city, state) VALUES
('560001', 'Downtown', 'Bangalore', 'Karnataka'),
('560002', 'Whitefield', 'Bangalore', 'Karnataka'),
('560003', 'Indiranagar', 'Bangalore', 'Karnataka'),
('560004', 'Koramangala', 'Bangalore', 'Karnataka'),
('560005', 'Hebbal', 'Bangalore', 'Karnataka'),
('560006', 'Electronic City', 'Bangalore', 'Karnataka');

-- ===================================
-- USERS (with hashed password: password123)
-- ===================================
INSERT INTO Users (name, email, password, phone, address_line, landmark, area_id, latitude, longitude, wallet_balance, rating) VALUES
('Prarthana Shetty', 'prarthana@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543210', '123 Main Street', 'Near Park', 1, 12.9716, 77.5946, 10000, 4.8),
('Srishti V', 'srishti@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543211', '456 Oak Avenue', 'Near Mall', 2, 12.9698, 77.5906, 8000, 4.5),
('Rahul Kumar', 'rahul@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543212', '789 Pine Road', 'Near School', 3, 12.9606, 77.6412, 6000, 4.7),
('Anjali Singh', 'anjali@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543213', '321 Elm Street', 'Near Hospital', 4, 12.9352, 77.6245, 9000, 4.6),
('Amit Patel', 'amit@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543214', '654 Maple Lane', 'Near Gym', 1, 12.9735, 77.5955, 4500, 4.9),
('Neha Gupta', 'neha@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543215', '987 Birch Street', 'Near Temple', 2, 12.9700, 77.5920, 5800, 4.4),
('Rohan Sharma', 'rohan@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543216', '147 Cedar Road', 'Near Park', 3, 12.9610, 77.6420, 3200, 4.3),
('Deepak Singh', 'deepak@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543217', '258 Spruce Ave', 'Near Station', 4, 12.9360, 77.6250, 6500, 4.8),
('Maya Verma', 'maya@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543218', '369 Walnut Ln', 'Near Market', 5, 12.9800, 77.6000, 4000, 4.5),
('Vikram Nair', 'vikram@example.com', '$2a$10$U9JZiNPsFJ9V3yDQcQvDXOPn.Z1mVqoU2vJ8qzV9P9Q1Q1Q1Q1Q1Q', '9876543219', '741 Ash Street', 'Near Library', 6, 12.9850, 77.6100, 5200, 4.7);

-- ===================================
-- TASKS (14 tasks)
-- ===================================
INSERT INTO Tasks (title, description, price, deadline, created_by, assigned_to, area_id, latitude, longitude, status, created_at) VALUES
('Home Cleaning', 'Need thorough home cleaning including kitchen, bedroom, and bathroom. Experienced cleaner preferred.', 500, DATE_ADD(NOW(), INTERVAL 2 DAY), 1, NULL, 1, 12.9716, 77.5946, 'OPEN', NOW()),
('Plumbing Repair', 'Fix leaking tap in kitchen. Need reliable plumber. ASAP preferred.', 800, DATE_ADD(NOW(), INTERVAL 1 DAY), 2, NULL, 2, 12.9698, 77.5906, 'OPEN', NOW()),
('Painting Work', 'Paint bedroom walls - color: light blue. Two walls need repainting.', 1200, DATE_ADD(NOW(), INTERVAL 5 DAY), 3, NULL, 3, 12.9606, 77.6412, 'OPEN', NOW()),
('Gardening Service', 'Maintain and trim plants in garden. Weekly maintenance preferred.', 400, DATE_ADD(NOW(), INTERVAL 4 DAY), 1, NULL, 1, 12.9716, 77.5946, 'OPEN', NOW()),
('AC Repair', 'Air conditioner not cooling properly. Needs inspection and repair.', 1000, DATE_ADD(NOW(), INTERVAL 1 DAY), 4, NULL, 4, 12.9352, 77.6245, 'OPEN', NOW()),
('Grocery Shopping', 'Need help with grocery shopping and delivery from supermarket.', 300, DATE_ADD(NOW(), INTERVAL 1 HOUR), 2, NULL, 2, 12.9698, 77.5906, 'OPEN', NOW()),
('Pet Grooming', 'Need dog grooming - bathing and basic haircut. Golden Retriever.', 600, DATE_ADD(NOW(), INTERVAL 6 DAY), 3, NULL, 3, 12.9606, 77.6412, 'OPEN', NOW()),
('Electrical Installation', 'Install decorative lights and ceiling fan. Some existing wiring.', 900, DATE_ADD(NOW(), INTERVAL 3 DAY), 4, 8, 4, 12.9352, 77.6245, 'ASSIGNED', NOW()),
('Furniture Assembly', 'Assemble IKEA bed and wardrobe. Parts ready at home.', 700, DATE_ADD(NOW(), INTERVAL 2 DAY), 1, 5, 1, 12.9716, 77.5946, 'ASSIGNED', NOW()),
('Vehicle Washing', 'Wash and detail car - full exterior and interior cleaning.', 450, DATE_ADD(NOW(), INTERVAL 1 DAY), 2, 6, 2, 12.9698, 77.5906, 'ASSIGNED', NOW()),
('House Shifting Help', 'Help with packing and loading furniture. 2-3 people needed.', 1500, DATE_SUB(NOW(), INTERVAL 5 DAY), 3, 7, 3, 12.9606, 77.6412, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Website Design', 'Design and setup basic portfolio website. Business profile.', 2500, DATE_SUB(NOW(), INTERVAL 3 DAY), 4, 9, 4, 12.9352, 77.6245, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Photography Service', 'Event photography for birthday party. 3-4 hours needed.', 1800, DATE_SUB(NOW(), INTERVAL 7 DAY), 1, 10, 1, 12.9716, 77.5946, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 7 DAY)),
('Tuition Support', 'Math tuition for 10th grade student. 6 months commitment.', 2000, DATE_SUB(NOW(), INTERVAL 4 DAY), 2, 5, 2, 12.9698, 77.5906, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ===================================
-- APPLICATIONS (12 applications)
-- ===================================
INSERT INTO Applications (task_id, applicant_id, status, applied_at) VALUES
(1, 5, 'PENDING', NOW()),
(1, 6, 'PENDING', NOW()),
(2, 7, 'PENDING', NOW()),
(3, 8, 'PENDING', NOW()),
(4, 5, 'PENDING', NOW()),
(6, 7, 'PENDING', NOW()),
(7, 6, 'PENDING', NOW()),
(8, 8, 'ACCEPTED', NOW()),
(9, 5, 'ACCEPTED', NOW()),
(10, 6, 'ACCEPTED', NOW()),
(1, 7, 'REJECTED', NOW()),
(2, 5, 'REJECTED', NOW());

-- ===================================
-- REVIEWS (6 reviews for completed tasks)
-- ===================================
INSERT INTO Reviews (task_id, reviewer_id, reviewed_user_id, rating, comment, created_at) VALUES
(11, 3, 7, 5, 'Excellent work! Very professional and clean. Highly recommend!', NOW()),
(12, 4, 9, 5, 'Outstanding website design. Delivered on time with great support.', NOW()),
(13, 1, 10, 4, 'Good photography work. Could have been more creative with angles.', NOW()),
(14, 2, 5, 5, 'Great tuition! My son improved significantly in math.', NOW()),
(11, 7, 3, 4, 'Good job overall. Very punctual and hardworking.', NOW()),
(12, 9, 4, 5, 'Professional work. Very satisfied with the quality.', NOW());

-- ===================================
-- TRANSACTIONS (4 completed task payments)
-- ===================================
INSERT INTO Transactions (task_id, payer_id, payee_id, amount, status, created_at) VALUES
(11, 3, 7, 1500, 'COMPLETED', NOW()),
(12, 4, 9, 2500, 'COMPLETED', NOW()),
(13, 1, 10, 1800, 'COMPLETED', NOW()),
(14, 2, 5, 2000, 'COMPLETED', NOW());

-- ===================================
-- NOTIFICATIONS (6 notifications)
-- ===================================
INSERT INTO Notifications (user_id, task_id, message, is_read, created_at) VALUES
(1, 1, 'New application received for your task "Home Cleaning"', 0, NOW()),
(2, 2, 'New application received for your task "Plumbing Repair"', 0, NOW()),
(5, 9, 'You were accepted for task "Furniture Assembly"', 0, NOW()),
(6, 10, 'You were accepted for task "Vehicle Washing"', 0, NOW()),
(8, 3, 'Your application for "Painting Work" was rejected', 0, NOW()),
(3, 11, 'Task "House Shifting Help" marked as completed', 1, NOW());

-- ===================================
-- VERIFICATION QUERIES (run these to verify data)
-- ===================================
-- SELECT COUNT(*) as total_users FROM Users;
-- SELECT COUNT(*) as total_tasks FROM Tasks;
-- SELECT COUNT(*) as total_applications FROM Applications;
-- SELECT status, COUNT(*) FROM Tasks GROUP BY status;
-- SELECT * FROM Users LIMIT 3;
-- SELECT * FROM Tasks WHERE status = 'OPEN';
-- Reset (recommended for clean setup)
DROP DATABASE IF EXISTS task_platform;
CREATE DATABASE task_platform;
USE task_platform;

-- =========================
-- AREA
-- =========================
CREATE TABLE Area (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    pincode VARCHAR(10) NOT NULL,
    locality VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100)
);

-- =========================
-- USERS
-- =========================
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,

    address_line VARCHAR(255),
    landmark VARCHAR(255),

    wallet_balance DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(2,1),

    area_id INT,

    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    FOREIGN KEY (area_id) REFERENCES Area(area_id)
);

-- =========================
-- TASKS
-- =========================
CREATE TABLE Tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),

    deadline DATETIME,
    status VARCHAR(50) DEFAULT 'OPEN',

    created_by INT,
    assigned_to INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES Users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES Users(user_id)
);

-- =========================
-- TRANSACTIONS
-- =========================
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT UNIQUE,
    payer_id INT,
    payee_id INT,
    amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (payer_id) REFERENCES Users(user_id),
    FOREIGN KEY (payee_id) REFERENCES Users(user_id)
);

-- =========================
-- REVIEWS
-- =========================
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT,
    reviewer_id INT,
    reviewed_user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (reviewer_id) REFERENCES Users(user_id),
    FOREIGN KEY (reviewed_user_id) REFERENCES Users(user_id)
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    task_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
);

-- =========================
-- APPLICATIONS
-- =========================
CREATE TABLE Applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT,
    applicant_id INT,
    status VARCHAR(50) DEFAULT 'PENDING',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (applicant_id) REFERENCES Users(user_id)
);

-- =====================================
-- USER AUTH & PROFILE
-- =====================================

INSERT INTO Users (name, email, password, area_id, wallet_balance)
VALUES (?, ?, ?, ?, 0);

SELECT user_id, password FROM Users WHERE email=?;

SELECT * FROM Users WHERE user_id=?;

UPDATE Users SET name=?, area_id=? WHERE user_id=?;

UPDATE Users SET password=? WHERE user_id=?;

DELETE FROM Users WHERE user_id=?;

-- =====================================
-- WALLET SYSTEM
-- =====================================

UPDATE Users SET wallet_balance = wallet_balance + ? WHERE user_id=?;

UPDATE Users SET wallet_balance = wallet_balance - ? WHERE user_id=?;

SELECT wallet_balance FROM Users WHERE user_id=?;

SELECT wallet_balance FROM Users WHERE user_id=?;

SELECT * FROM Users WHERE wallet_balance > ?;

-- =====================================
-- TASK MANAGEMENT
-- =====================================

INSERT INTO Tasks (created_by, title, description, price, status, created_at)
VALUES (?, ?, ?, ?, 'OPEN', NOW());

SELECT T.*, U.name
FROM Tasks T
JOIN Users U ON T.created_by = U.user_id
WHERE T.status='OPEN';

SELECT T.*, U.name
FROM Tasks T
JOIN Users U ON T.created_by = U.user_id
WHERE T.task_id=?;

SELECT * FROM Tasks WHERE created_by=?;

UPDATE Tasks SET title=?, description=?, price=? WHERE task_id=?;

DELETE FROM Applications WHERE task_id=?;
DELETE FROM Tasks WHERE task_id=?;

SELECT * FROM Tasks WHERE title LIKE CONCAT('%', ?, '%');

SELECT * FROM Tasks WHERE price BETWEEN ? AND ?;

SELECT * FROM Tasks ORDER BY created_at DESC;

-- =====================================
-- APPLICATION SYSTEM
-- =====================================

INSERT INTO Applications (task_id, applicant_id, status)
VALUES (?, ?, 'PENDING');

SELECT * FROM Applications
WHERE task_id=? AND applicant_id=?;

SELECT A.*, U.name
FROM Applications A
JOIN Users U ON A.applicant_id = U.user_id
WHERE A.task_id=?;

SELECT * FROM Applications WHERE applicant_id=?;

SELECT T.*, A.status
FROM Tasks T
JOIN Applications A ON T.task_id=A.task_id
WHERE A.applicant_id=?;

-- =====================================
-- ACCEPT / REJECT FLOW
-- =====================================

SELECT * FROM Applications
WHERE task_id=? AND status='ACCEPTED';

UPDATE Applications SET status='ACCEPTED'
WHERE application_id=?;

UPDATE Applications SET status='REJECTED'
WHERE task_id=? AND application_id!=?;

UPDATE Tasks SET status='ASSIGNED' WHERE task_id=?;

SELECT applicant_id FROM Applications
WHERE task_id=? AND status='ACCEPTED';

-- =====================================
-- WORKER DASHBOARD
-- =====================================

SELECT T.*
FROM Tasks T
JOIN Applications A ON T.task_id=A.task_id
WHERE A.applicant_id=? AND A.status='ACCEPTED';

SELECT T.*
FROM Tasks T
JOIN Applications A ON T.task_id=A.task_id
WHERE A.applicant_id=? AND T.status='COMPLETED';

-- =====================================
-- TASK COMPLETION & PAYMENT
-- =====================================

UPDATE Tasks SET status='COMPLETED' WHERE task_id=?;

START TRANSACTION;

UPDATE Users SET wallet_balance = wallet_balance - ? WHERE user_id=?;
UPDATE Users SET wallet_balance = wallet_balance + ? WHERE user_id=?;

COMMIT;

-- =====================================
-- REVIEWS
-- =====================================

INSERT INTO Reviews (task_id, reviewer_id, reviewed_user_id, rating, comment)
VALUES (?, ?, ?, ?, ?);

SELECT R.*, U.name
FROM Reviews R
JOIN Users U ON R.reviewer_id=U.user_id
WHERE R.reviewed_user_id=?;

SELECT * FROM Reviews WHERE task_id=?;

SELECT AVG(rating) FROM Reviews WHERE reviewed_user_id=?;

-- =====================================
-- DASHBOARD
-- =====================================

SELECT COUNT(*) FROM Tasks WHERE created_by=?;

SELECT COUNT(*) FROM Tasks
WHERE created_by=? AND status='COMPLETED';

SELECT SUM(T.price)
FROM Tasks T
JOIN Applications A ON T.task_id=A.task_id
WHERE A.applicant_id=? AND T.status='COMPLETED';

-- =====================================
-- ADMIN PANEL
-- =====================================

SELECT * FROM Users;

SELECT * FROM Tasks;

SELECT * FROM Applications;

SELECT * FROM Reviews;

DELETE FROM Users WHERE user_id=?;

DELETE FROM Tasks WHERE task_id=?;

SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Tasks;
SELECT COUNT(*) FROM Applications;
SELECT COUNT(*) FROM Reviews;

SELECT status, COUNT(*) FROM Tasks GROUP BY status;

SELECT area_id, COUNT(*) FROM Users GROUP BY area_id;

-- =====================================
-- ANALYTICS
-- =====================================

SELECT reviewed_user_id, AVG(rating) AS avg_rating
FROM Reviews
GROUP BY reviewed_user_id
ORDER BY avg_rating DESC;

SELECT created_by, COUNT(*) AS total_tasks
FROM Tasks
GROUP BY created_by
ORDER BY total_tasks DESC;

SELECT task_id, COUNT(*) AS applications
FROM Applications
GROUP BY task_id
ORDER BY applications DESC;

SELECT DATE(created_at), COUNT(*)
FROM Tasks
GROUP BY DATE(created_at);

SELECT MAX(price), MIN(price), AVG(price) FROM Tasks;
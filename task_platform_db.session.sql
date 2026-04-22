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
    status VARCHAR(50) DEFAULT 'open',

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

    task_id INT UNIQUE,   -- 1:1 with task

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
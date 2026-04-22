USE task_platform;

CREATE TABLE Area (
    area_id INT PRIMARY KEY,
    pincode VARCHAR(10),
    locality VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100)
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255),

    address_line VARCHAR(255),
    landmark VARCHAR(255),

    wallet_balance DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(2,1),

    area_id INT,

    FOREIGN KEY (area_id) REFERENCES Area(area_id)
);

CREATE TABLE Tasks (
    task_id INT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),

    deadline DATETIME,
    status VARCHAR(50),

    created_by INT,
    assigned_to INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES Users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES Users(user_id)
);

CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY,

    task_id INT UNIQUE,   -- ensures 1:1 relation with task

    payer_id INT,
    payee_id INT,

    amount DECIMAL(10,2),
    status VARCHAR(50),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES Tasks(task_id),
    FOREIGN KEY (payer_id) REFERENCES Users(user_id),
    FOREIGN KEY (payee_id) REFERENCES Users(user_id)
);

CREATE TABLE Reviews (
    review_id INT PRIMARY KEY,

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

CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY,

    user_id INT,
    task_id INT,

    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(task_id)
);

-- Area
INSERT INTO Area VALUES (1, '560001', 'MG Road', 'Bangalore', 'Karnataka');

-- Users
INSERT INTO Users VALUES 
(1, 'Alice', 'alice@mail.com', '9999999999', 'pass', 'Street 1', 'Near Park', 1000, 4.5, 1),
(2, 'Bob', 'bob@mail.com', '8888888888', 'pass', 'Street 2', 'Near Mall', 500, 4.2, 1);

-- Task
INSERT INTO Tasks (task_id, title, description, price, deadline, status, created_by, assigned_to)
VALUES (1, 'Fix Laptop', 'Repair issue', 500, NOW(), 'open', 1, 2);

-- Transaction
INSERT INTO Transactions (transaction_id, task_id, payer_id, payee_id, amount, status)
VALUES (1, 1, 1, 2, 500, 'completed');

-- Review
INSERT INTO Reviews (review_id, task_id, reviewer_id, reviewed_user_id, rating, comment)
VALUES (1, 1, 1, 2, 5, 'Great work');

-- Notification
INSERT INTO Notifications (notification_id, user_id, task_id, message)
VALUES (1, 2, 1, 'Task assigned');


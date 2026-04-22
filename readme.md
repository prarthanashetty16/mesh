# Task Sharing Platform – DBMS Project

## Overview

This project implements a relational database for a task sharing platform. Users can create tasks, assign them to others, complete work, make payments, and provide reviews. The system models a real-world service marketplace using structured database design.

---

## Objectives

* Design a normalized relational schema
* Implement relationships using foreign keys
* Ensure data integrity using constraints
* Represent a complete task lifecycle
* Support backend integration

---

## Database Design

### Entities

* Area
* Users
* Tasks
* Transactions
* Reviews
* Notifications

### Relationships

* One Area can have multiple Users
* A User can create multiple Tasks
* A Task is assigned to one User
* Each Task has one Transaction
* Users can review other Users
* Notifications are generated for Users based on Tasks

---

## Schema Features

* Auto-increment primary keys for all tables
* Foreign key constraints for referential integrity
* Unique constraint on user email
* Rating constraints for valid values
* Default values for timestamps and balances
* One-to-one mapping between Tasks and Transactions

---

## Technologies Used

* MySQL
* Visual Studio Code (SQLTools)
* MySQL Workbench

---

## Project Workflow

1. A user registers in the system
2. The user creates a task
3. Another user accepts the task
4. The task is assigned
5. A transaction is recorded after completion
6. Users provide reviews
7. Notifications are generated

---

## How to Run

1. Open MySQL Workbench or VS Code with SQLTools
2. Execute the schema file to create the database and tables
3. Run queries to test the system

---

## Key Functionalities

* User management
* Task creation and assignment
* Payment tracking
* Review and rating system
* Notification system

---

## Future Enhancements

* Backend integration using Node.js or Flask
* Frontend interface for user interaction
* Authentication and authorization
* Real-time notifications
* Payment gateway integration

---

## Author

Shetty Prarthana Dilip - 1MS24CS173
Srishti V - 1MS24CS188

---

## Note

This project is developed as part of a DBMS course and demonstrates core concepts such as relational modeling, normalization, and SQL-based data operations.
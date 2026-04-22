# Task Sharing Platform - Backend API

A complete Node.js/Express backend for a task-sharing platform (similar to UrbanClap/TaskRabbit) with:
- User authentication (JWT)
- Task creation and management
- Application system (users apply for tasks)
- Real-time location tracking (Haversine formula)
- Wallet system with payment processing
- Reviews and ratings
- Admin dashboard and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Installation

1. **Clone/Setup the project**
```bash
cd backend
npm install
```

2. **Setup Database**
```bash
# Run the database schema from task_platform_db.session.sql in your MySQL
mysql -u root -p < ../task_platform_db.session.sql
```

3. **Configure Environment**
```bash
# Copy .env.example to .env and update values
cp .env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_platform
JWT_SECRET=your_secret_key
```

4. **Seed Database with Sample Data**
```bash
npm run seed
```

5. **Start Server**
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "area_id": 1,
  "address_line": "123 Main Street",
  "landmark": "Near Park",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 👤 User Endpoints

### Get Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "address_line": "456 New Street",
  "landmark": "Near School",
  "latitude": 12.9700,
  "longitude": 77.6000
}
```

### Get Wallet Balance
```http
GET /user/wallet
Authorization: Bearer <token>
```

### Get User Reviews
```http
GET /user/reviews
Authorization: Bearer <token>
```

---

## 📋 Task Endpoints

### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Home Cleaning",
  "description": "Need thorough cleaning for apartment",
  "price": 500,
  "deadline": "2024-05-01T10:00:00Z",
  "area_id": 1,
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### Get All Open Tasks
```http
GET /tasks?page=1&limit=10
```

### Get Nearby Tasks (Haversine Formula)
```http
GET /tasks/nearby?latitude=12.9716&longitude=77.5946&page=1&limit=10
```
- Returns tasks within 10km radius
- Distance calculated using Haversine formula

### Filter Tasks
```http
GET /tasks/filter?status=OPEN&minPrice=100&maxPrice=1000&area_id=1&page=1
```

### Get Task by ID
```http
GET /tasks/:id
```

### Get My Created Tasks
```http
GET /tasks/my/created?page=1&limit=10
Authorization: Bearer <token>
```

### Get My Accepted Tasks
```http
GET /tasks/my/accepted?page=1&limit=10
Authorization: Bearer <token>
```

### Update Task Status
```http
PUT /tasks/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

Valid statuses: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Complete Task & Process Payment
```http
POST /tasks/:id/complete
Authorization: Bearer <token>
```

Deducts payment from creator and adds to performer.
**Requires:** Creator has sufficient wallet balance.

### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

Can only delete if task status is `OPEN` or `CANCELLED`.

---

## 📝 Application Endpoints

### Apply for Task
```http
POST /applications/:task_id/apply
Authorization: Bearer <token>
```

- User cannot apply for own tasks
- User cannot apply twice for same task

### Get Applications for Task
```http
GET /applications/task/:task_id
Authorization: Bearer <token>
```

Only task creator can view applications.

### Get My Applications
```http
GET /applications/my
Authorization: Bearer <token>
```

### Accept Application
```http
POST /applications/:app_id/accept
Authorization: Bearer <token>
```

- Task is assigned to applicant
- Other applications are rejected
- Task status changes to `ASSIGNED`

### Reject Application
```http
POST /applications/:app_id/reject
Authorization: Bearer <token>
```

### Check Price Suggestion
```http
GET /applications/task/:task_id/price-suggestion
```

If task not accepted for 5 minutes, suggests lowering price by 10%.

---

## 📍 Location Endpoints

### Update Location
```http
POST /location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9700,
  "longitude": 77.6000
}
```

Updates performer's live location.

### Get My Location
```http
GET /location/me
Authorization: Bearer <token>
```

### Get Task Performer Location
```http
GET /location/task/:task_id
Authorization: Bearer <token>
```

Only task creator can view performer location.
Tracking ends after task completion.

---

## 💰 Wallet Endpoints

### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer <token>
```

### Get Transaction History
```http
GET /wallet/transactions
Authorization: Bearer <token>
```

Returns all paid and earned transactions.

### Get Wallet Summary
```http
GET /wallet/summary
Authorization: Bearer <token>
```

Shows current balance, total paid, total earned, and net balance.

---

## ⭐ Review Endpoints

### Add Review
```http
POST /reviews/task/:task_id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent work, very professional"
}
```

- Only task creator or performer can review
- Task must be completed
- Cannot review twice for same task
- Rating: 1-5

### Get Reviews for User
```http
GET /reviews/user/:user_id
```

### Get Reviews for Task
```http
GET /reviews/task/:task_id
```

---

## 📊 Admin Endpoints

### Get Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

Returns:
- Total users, tasks, completed tasks
- Tasks by status breakdown
- Total transaction amount
- Average task price

### Get All Users
```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <token>
```

### Get All Tasks
```http
GET /admin/tasks?status=OPEN&page=1&limit=20
Authorization: Bearer <token>
```

### Get All Transactions
```http
GET /admin/transactions?page=1&limit=20
Authorization: Bearer <token>
```

### Get All Reviews
```http
GET /admin/reviews?page=1&limit=20
Authorization: Bearer <token>
```

### Get Analytics
```http
GET /admin/analytics
Authorization: Bearer <token>
```

Returns:
- Tasks created per day (last 30 days)
- Revenue per day (last 30 days)
- Top 5 earning users
- Task completion rate

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection & utilities
├── controllers/             # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── taskController.js
│   ├── applicationController.js
│   ├── locationController.js
│   ├── walletController.js
│   ├── reviewController.js
│   └── adminController.js
├── middleware/              # Express middleware
│   ├── auth.js
│   ├── validation.js
│   └── error.js
├── models/                  # Database queries
│   ├── User.js
│   ├── Task.js
│   ├── Application.js
│   ├── Review.js
│   ├── Transaction.js
│   └── Area.js
├── routes/                  # Route definitions
│   ├── auth.js
│   ├── user.js
│   ├── task.js
│   ├── application.js
│   ├── location.js
│   ├── wallet.js
│   ├── review.js
│   └── admin.js
├── scripts/
│   └── seed.js             # Database seeding script
├── app.js                   # Express app setup
├── server.js               # Server entry point
├── .env                    # Environment variables
├── .env.example            # Example env file
└── package.json            # Dependencies
```

---

## 🔑 Key Features

### 1. Haversine Formula Location Matching
- Finds tasks within 10km radius of user
- Uses formula: `distance = 6371 * 2 * ASIN(SQRT(...))`
- Configurable via `NEARBY_DISTANCE_KM` in .env

### 2. Application System
- Users apply for tasks
- Task creator accepts/rejects applications
- Cannot apply for own tasks
- Price suggestion after 5 minutes with no acceptances

### 3. Wallet System
- Each user has wallet balance
- Payment processed when task completed
- Creator's balance deducted, performer's balance credited
- Balance check before completion

### 4. Location Tracking
- Real-time location updates for performers
- Area stored per user
- Tracking ends after task completion
- Only task creator can view performer location

### 5. Reviews & Ratings
- Users rate each other after task completion
- Both creator and performer can review
- Rating 1-5
- Average rating calculated per user

### 6. Admin Dashboard
- Real-time analytics
- User, task, transaction, and review management
- Completion rate tracking
- Top earning users report

---

## 🧪 Testing with Sample Data

After running `npm run seed`, you can login with:

```
Email: prarthana@example.com
Password: password123

Email: srishti@example.com
Password: password456
```

Sample tasks and applications are pre-populated.

---

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcrypt
- Input validation for all endpoints
- Email uniqueness constraint
- Foreign key constraints for referential integrity
- Protected admin routes (recommend adding role-based access in production)

---

## 📝 Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=task_platform
DB_PORT=3306

JWT_SECRET=your_secret_key_change_this
NODE_ENV=development
PORT=5000

NEARBY_DISTANCE_KM=10
PRICE_SUGGESTION_MINUTES=5
```

---

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## 📞 Support

For issues or questions, please refer to the database schema documentation or contact the development team.

---

## 📄 License

MIT

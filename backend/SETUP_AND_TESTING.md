# 🚀 Setup & Testing Guide

## Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Database
Make sure MySQL is running, then:
```bash
# Import the schema
mysql -u root -p < ../task_platform_db.session.sql
```

### Step 3: Configure Environment
```bash
# The .env file is already created with default settings
# If needed, update your credentials in .env
```

### Step 4: Seed Sample Data
```bash
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
📍 Seeding Areas...
✅ Areas seeded

👥 Seeding Users...
✅ Users seeded

📋 Seeding Tasks...
✅ Tasks seeded

📝 Seeding Applications...
✅ Applications seeded

💰 Seeding Transactions...
✅ Transactions seeded

⭐ Seeding Reviews...
✅ Reviews seeded

✨ Database seeding completed successfully!
```

### Step 5: Start Server
```bash
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:5000
📝 Environment: development
🗄️  Database: task_platform on localhost
```

---

## 🧪 API Testing Workflow

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210",
    "area_id": 1,
    "address_line": "123 Test Street",
    "landmark": "Near Park",
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

**Save the token from response!**

### 2. Login with Existing User

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prarthana@example.com",
    "password": "password123"
  }'
```

Sample credentials after seeding:
- Email: `prarthana@example.com` | Password: `password123`
- Email: `srishti@example.com` | Password: `password456`

### 3. Get User Profile

```bash
curl -X GET http://localhost:5000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Task

```bash
curl -X POST http://localhost:5000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "House Painting",
    "description": "Paint all walls in living room",
    "price": 1500,
    "deadline": "2024-05-15T10:00:00Z",
    "area_id": 1,
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

### 5. Get All Open Tasks

```bash
curl -X GET "http://localhost:5000/tasks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get Nearby Tasks (10km radius)

```bash
curl -X GET "http://localhost:5000/tasks/nearby?latitude=12.9716&longitude=77.5946&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Apply for a Task

```bash
curl -X POST http://localhost:5000/applications/1/apply \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. View Applications for Your Task

```bash
curl -X GET http://localhost:5000/applications/task/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

(As task creator)

### 9. Accept an Application

```bash
curl -X POST http://localhost:5000/applications/1/accept \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

(As task creator - replaces `1` with application ID)

### 10. Update Location (Live Tracking)

```bash
curl -X POST http://localhost:5000/location/update \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9700,
    "longitude": 77.6000
  }'
```

### 11. Get Performer Location (For Task Creator)

```bash
curl -X GET http://localhost:5000/location/task/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 12. Update Task Status to In Progress

```bash
curl -X PUT http://localhost:5000/tasks/1/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

### 13. Complete Task & Process Payment

```bash
curl -X POST http://localhost:5000/tasks/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

(As task creator - transfers payment from creator to performer)

### 14. Check Wallet Balance

```bash
curl -X GET http://localhost:5000/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 15. View Transaction History

```bash
curl -X GET http://localhost:5000/wallet/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 16. Add Review for Completed Task

```bash
curl -X POST http://localhost:5000/reviews/task/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent work, very professional!"
  }'
```

### 17. Get Reviews for a User

```bash
curl -X GET http://localhost:5000/reviews/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 18. Admin: Get Dashboard

```bash
curl -X GET http://localhost:5000/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 19. Admin: Get All Users

```bash
curl -X GET "http://localhost:5000/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 20. Admin: Get Analytics

```bash
curl -X GET http://localhost:5000/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Complete Task Workflow

Here's a complete end-to-end flow:

### Scenario: User A creates a task, User B applies and gets accepted, completes and reviews

**As User A:**
1. Create task
2. View applications
3. Accept application from User B
4. Update task status to IN_PROGRESS
5. Update task status to COMPLETED (processes payment)

**As User B:**
1. Login
2. View nearby tasks
3. Apply for task from User A
4. Wait to be accepted
5. Update location (live tracking)
6. View assigned tasks
7. After task completion by creator, add review

---

## 🛠️ Useful Commands

### Restart Server
```bash
npm run dev
```
(Press Ctrl+C to stop, then run again)

### Re-seed Database
```bash
npm run seed
```

### Check Database
```bash
mysql -u root -p task_platform
SELECT * FROM Users;
SELECT * FROM Tasks;
```

### View Server Logs
Logs appear in the terminal running the server

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create task
- [ ] Can apply for task
- [ ] Can accept application
- [ ] Can complete task (payment processes)
- [ ] Can add review
- [ ] Wallet balance updates correctly
- [ ] Admin dashboard accessible

---

## 🆘 Troubleshooting

### Issue: "Connection refused" on database
**Solution:** Make sure MySQL is running
```bash
# Windows
mysql --version

# Mac/Linux
sudo systemctl start mysql
```

### Issue: "Port 5000 already in use"
**Solution:** Change PORT in .env or kill process on port 5000
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "ENOENT: no such file or directory, open '.env'"
**Solution:** .env file already exists, but check DB credentials are correct

### Issue: "Invalid token"
**Solution:** Make sure token is still valid and included correctly:
```
Authorization: Bearer <your_actual_token>
```

### Issue: Seeding script fails
**Solution:** Ensure database is created:
```bash
mysql -u root -p < ../task_platform_db.session.sql
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Coordinates are decimal degrees (latitude: -90 to 90, longitude: -180 to 180)
- Prices are in decimal format (e.g., 500.50)
- Ratings are integer 1-5
- Default nearby radius is 10km (configurable in .env)
- Tokens expire after 7 days
- Location tracking ends after task completion

---

## 🎉 Ready to Go!

Your backend is now ready for development and testing. Use the provided curl commands or import the Postman collection for easier testing.

Happy coding! 🚀

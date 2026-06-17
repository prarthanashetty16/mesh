# 🎯 Mesh - Task Sharing Platform

A full-stack task marketplace where users can post jobs, apply for work, manage payments, and build reputation through reviews.

---

## 📚 Documentation

### **For Running the Demo Locally** 🚀
👉 **[QUICK_START_DEMO.md](QUICK_START_DEMO.md)** - Start here!
- 5-minute setup guide
- Database troubleshooting
- Demo account credentials
- Quick commands reference

### **For Complete Setup Details** 📖
👉 **[DEMO_SETUP_GUIDE.md](DEMO_SETUP_GUIDE.md)** - Comprehensive guide
- Detailed setup options (Cloud vs Local)
- Complete troubleshooting
- Demo workflows
- Success checklist

### **Backend API Documentation** 🔧
👉 **[backend/BACKEND_STRUCTURE.md](backend/BACKEND_STRUCTURE.md)**
- Complete API routes
- Database schema
- Authentication system

### **Testing & Workflow** 🧪
👉 **[backend/SETUP_AND_TESTING.md](backend/SETUP_AND_TESTING.md)**
- API testing examples
- cURL commands
- Postman collection

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Setup database (local MySQL recommended)
mysql -u root < task_platform_db.session.sql

# 2. Seed demo data
cd backend
npm install
npm run seed

# 3. Start backend (Terminal 1)
npm run dev

# 4. Start frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 5. Open browser
# http://localhost:3000/mesh/
```

**Demo Credentials:**
- Email: `prarthana@example.com` | Password: `password123`
- Email: `amit@example.com` | Password: `password123`

---

## ✨ Key Features

- ✅ **Task Marketplace** - Post and browse tasks
- ✅ **Application System** - Apply for work, accept/reject applicants
- ✅ **Wallet & Payments** - Secure payment processing
- ✅ **Reviews & Ratings** - Build trust with ratings
- ✅ **Location Aware** - Find tasks nearby
- ✅ **Real-time Dashboard** - Track statistics
- ✅ **Admin Panel** - Manage users and tasks
- ✅ **Authentication** - JWT-based security

---

## 📦 Tech Stack

### **Frontend**
- React 18 + Vite
- React Router for navigation
- Tailwind CSS for styling
- Zustand for state management
- Axios for API calls

### **Backend**
- Node.js + Express
- MySQL database
- JWT authentication
- bcrypt password hashing
- CORS enabled

### **Database**
- MySQL 5.7+
- 8 tables with relationships
- Prepared for ~1000 concurrent users

---

## 📊 Project Structure

```
Mesh/
├── frontend/              # React Vite app
│   ├── src/
│   │   ├── pages/        # All routes
│   │   ├── components/   # Reusable UI
│   │   ├── store/        # State management
│   │   └── api/          # API client
│   └── vite.config.js
│
├── backend/              # Express API
│   ├── config/          # Database setup
│   ├── controllers/      # Business logic
│   ├── models/          # DB queries
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation
│   ├── scripts/         # Seed & diagnostics
│   └── package.json
│
├── task_platform_db.session.sql  # Database schema
├── QUICK_START_DEMO.md           # Quick setup
└── DEMO_SETUP_GUIDE.md           # Complete guide
```

---

## 🔧 Database Schema

**Tables:**
- `Users` - User profiles and wallets
- `Area` - Geographic locations
- `Tasks` - Job postings
- `Applications` - Apply for tasks
- `Reviews` - Ratings and comments
- `Transactions` - Payment history
- `Notifications` - User alerts
- `TaskAttachments` - Supporting files

---

## 🚀 Demo Data Included

After seeding, you get:
- **10 Users** - 4 task creators, 6 performers
- **14 Tasks** - Open, assigned, and completed
- **12 Applications** - Pending, accepted, rejected
- **6 Reviews** - 4-5 star ratings
- **4 Transactions** - Payment history
- **Multiple Scenarios** - Ready for demo workflow

---

## 🐛 Troubleshooting

### **Database Connection Issues?**
👉 See [QUICK_START_DEMO.md](QUICK_START_DEMO.md#-still-having-issues)

### **API Errors?**
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check database
npm run diagnose
```

### **Frontend Won't Load?**
- Verify backend running on port 5000
- Check CORS settings in `backend/app.js`
- Open browser DevTools (F12) for console errors

---

## 📞 Available Scripts

```bash
# Backend
npm run dev       # Start dev server with hot reload
npm run start     # Start production server
npm run seed      # Populate database with demo data
npm run diagnose  # Check database connection

# Frontend
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run deploy    # Deploy to GitHub Pages
```

---

## 🎓 Learning Resources

- [Mesh Platform Demo Workflow](DEMO_SETUP_GUIDE.md#-demo-talking-points)
- [API Testing Guide](backend/SETUP_AND_TESTING.md)
- [Database Schema](task_platform_db.session.sql)
- [Backend Documentation](backend/BACKEND_STRUCTURE.md)

---

## 📝 Demo Checklist

- [ ] Database connected
- [ ] Data seeded (10+ users)
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Can login with demo account
- [ ] Can browse 14 tasks
- [ ] Can apply for task
- [ ] Can view applications
- [ ] Wallet balance displays
- [ ] Reviews show ratings

---

## 🚀 Ready to Demo?

1. **New to this project?** → Start with [QUICK_START_DEMO.md](QUICK_START_DEMO.md)
2. **Having issues?** → Check [troubleshooting section](#-troubleshooting)
3. **Want all details?** → Read [DEMO_SETUP_GUIDE.md](DEMO_SETUP_GUIDE.md)

---
**Happy demoing! 🎉**

# 🚀 ZNHS AIMS - Quick Setup Guide

Pag-setup ng Zaragoza National High School Academic Information Management System

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (sa bagong terminal)
cd frontend
npm install
```

### Step 2: Create Environment Files

#### Backend `.env` file
Create `backend/.env`:
```env
MONGODB_URI="mongodb+srv://yurisuncheeze27_db_user:xSmOubII6ILA9wF4@cluster0.fkqcwiq.mongodb.net/?appName=Cluster0"
JWT_SECRET="znhs_aims_secret_key_2025_secure_token"
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local` file
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
✅ Backend should run on `http://localhost:5000`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
✅ Frontend should run on `http://localhost:3000`

### Step 4: Create Admin Account

Since the database is fresh, you need to create accounts first.

**Option A: Using MongoDB Compass/Atlas**
- Connect to your MongoDB Atlas cluster
- Go to `znhs_aims` database
- Insert a staff document manually with `role: "admin"`

**Option B: Create through API (using Postman/Thunder Client)**

POST `http://localhost:5000/api/staff` with body:
```json
{
  "name": "Admin User",
  "email": "admin@znhs.edu.ph",
  "idNumber": "ADMIN001",
  "password": "admin123",
  "role": "admin",
  "subject": "Administrator",
  "contact": "09123456789"
}
```

### Step 5: Login and Explore! 🎉

1. Open `http://localhost:3000`
2. Click "Access Staff Portal"
3. Login with your admin credentials
4. Start adding students, teachers, and managing the system!

## 📋 What You Can Do Now

### As Admin:
- ➕ Add students and staff
- 📅 Create events and announcements
- 📊 View system statistics
- ⚙️ Manage system settings

### As Teacher:
- 📝 Enter student grades
- ✓ Mark attendance
- 📢 Post announcements

### As Student:
- 📊 View grades
- 📅 Check attendance
- 📚 Access subject materials

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# If occupied, kill the process or change PORT in .env
```

### Frontend not connecting?
- Make sure backend is running first
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and reload

### MongoDB connection error?
- Verify MongoDB Atlas cluster is running
- Check if your IP is whitelisted in MongoDB Atlas
- Test connection string in MongoDB Compass

### Can't login?
- Ensure you've created a user account
- Check browser console for errors
- Verify backend API is responding

## 📁 Project Structure

```
ZNHS proj/
├── backend/                 ← Node.js + Express API
│   ├── models/              ← MongoDB schemas
│   ├── controllers/         ← Business logic
│   ├── routes/              ← API endpoints
│   └── server.js            ← Entry point
├── frontend/                ← Next.js app
│   ├── app/                 ← Pages (App Router)
│   ├── components/          ← Reusable components
│   ├── context/             ← Auth context
│   └── utils/               ← API client & helpers
└── README.md
```

## 🎯 Next Steps

1. **Customize branding** - Update school info in landing page
2. **Add demo data** - Create sample students, grades, events
3. **Test all features** - Try each dashboard and feature
4. **Deploy** - Host on Vercel (frontend) and Railway/Render (backend)

## 📚 Additional Resources

- **Backend API Docs**: See `backend/README.md`
- **Frontend Docs**: See `frontend/README.md`
- **Full Documentation**: See `README.md`

## 🆘 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in `.env` |
| CORS error | Check API URL in frontend |
| Database connection failed | Verify MongoDB URI |
| Can't see my changes | Clear `.next` cache |

## ✅ System Requirements

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB Atlas**: Free tier account
- **Browser**: Modern browser (Chrome, Firefox, Edge)

## 🎉 You're All Set!

Your ZNHS Academic Information Management System is ready to use!

Para sa further assistance:
- Check documentation files
- Review code comments
- Test all features thoroughly

**Good luck! 🚀**


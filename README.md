# ZNHS Academic Information Management System (AIMS)

## 📚 Project Overview

The **ZNHS Academic Information Management System (AIMS)** is a comprehensive school management platform designed for Zaragoza National High School. It's a modern, full-stack web application that helps manage student records, grades, attendance, classes, announcements, and more in one centralized system.

### 🎯 Who Can Use This?

- **Students**: View their grades, attendance, class materials, and announcements
- **Teachers**: Manage grades, track attendance, upload learning materials, and communicate with students
- **Administrators**: Manage students, staff, classes, events, and overall system operations

---

## ✨ Key Features

### For Students
- 📊 **View Grades**: Check subject-wise grades for all quarters
- 📋 **Attendance Tracking**: Monitor personal attendance records
- 📚 **Learning Materials**: Download materials uploaded by teachers
- 📢 **Announcements**: Receive class and school-wide announcements
- 👤 **Profile Management**: Update personal information and profile picture

### For Teachers
- 📝 **Gradebook**: Enter and manage student grades easily
- 📍 **Attendance Records**: Mark and track student attendance
- 📤 **Upload Materials**: Share learning materials with students
- 📣 **Create Announcements**: Communicate with students and classes
- 📊 **Advisory Class View**: View all grades for students you advise
- 👥 **Class Management**: See assigned classes and students

### For Administrators
- 👨‍🎓 **Student Management**: Add, edit, delete student records
- 👨‍🏫 **Staff Management**: Manage teacher and admin accounts
- 🏫 **Class Management**: Create classes, assign teachers, set advisers
- 📊 **Grade Management**: View and manage all grades in the system
- 📅 **Attendance Oversight**: Monitor school-wide attendance
- 📢 **Event Management**: Create school events and announcements
- 🔐 **User Roles**: Assign roles and manage permissions

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud-hosted via MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Upload**: Multer for avatar and document uploads

---

## 📋 Prerequisites

Before you start, make sure you have the following installed on your computer:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open terminal/command prompt and type `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: Type `npm --version` in terminal

3. **Git** (optional, but recommended)
   - Download from: https://git-scm.com/

4. **MongoDB Account** (free)
   - Create account at: https://www.mongodb.com/cloud/atlas
   - This is where your database will be stored

---

## 🚀 Installation & Setup Guide

Follow these steps carefully to get the project running on your computer.

### Step 1: Download the Project

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/gillian6969/ZNHS_Proj-2.0.git
cd ZNHS_Proj-2.0
```

**Option B: Manual Download**
- Go to the GitHub repository
- Click the green "Code" button
- Select "Download ZIP"
- Extract the folder to your desired location
- Open terminal/command prompt in the extracted folder

---

### Step 2: Set Up MongoDB Database

#### 2.1 Create a MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Create an account" (or sign in if you have one)
3. Fill in your email, password, and create your account
4. Verify your email address

#### 2.2 Create a Free Cluster
1. After logging in, click "Create" under "Databases"
2. Choose the **Free** tier (M0)
3. Select your preferred region (choose the one closest to you)
4. Click "Create Cluster" and wait for it to be created (may take 2-3 minutes)

#### 2.3 Get Your Connection String
1. Click "Connect" on your cluster
2. Choose "Drivers" (not MongoDB Compass)
3. Select "Node.js" as the driver
4. Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
5. Replace `<username>`, `<password>`, and database name as needed

#### 2.4 Create Database Access
1. In MongoDB Atlas, go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Create a username and password (remember these!)
4. Make sure "Built-in Role" is set to "Read and write to any database"
5. Click "Add User"

---

### Step 3: Set Up Backend (Server)

1. **Open terminal/command prompt** and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. **Create environment file** (`.env`):
   - In the `backend` folder, create a new file named `.env`
   - Add the following lines (replace with your actual values):
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/znhs?retryWrites=true&w=majority
     JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
     PORT=5000
     NODE_ENV=development
     ```
   - **Important**: Make sure `MONGODB_URI` has your MongoDB username and password

3. **Install dependencies**:
   ```bash
   npm install
   ```
   (This will download all required packages - may take 2-3 minutes)

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   - You should see: `Server running in development mode on port 5000`
   - Leave this terminal running!

---

### Step 4: Set Up Frontend (Client)

1. **Open a NEW terminal/command prompt** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. **Create environment file** (`.env.local`):
   - In the `frontend` folder, create a new file named `.env.local`
   - Add the following line:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
   (This will download all required packages - may take 2-3 minutes)

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   - You should see: `▲ Next.js X.X.X`
   - The app will open automatically, or go to: http://localhost:3000

---

## 🧪 Troubleshooting

### Problem: "Cannot find module" error
**Solution**: Make sure you ran `npm install` in both `backend` and `frontend` folders

### Problem: "MONGODB_URI is not defined"
**Solution**: Check that your `.env` file is in the `backend` folder and contains the correct connection string

### Problem: "Connection refused" when accessing http://localhost:3000
**Solution**: Make sure the backend server is running (you should see the message in the backend terminal)

### Problem: "Port 5000 already in use"
**Solution**: Change the `PORT` in `.env` to another number (e.g., 5001) and update `NEXT_PUBLIC_API_URL` accordingly

### Problem: Cannot log in
**Solution**: 
- Make sure database is seeded: run `node seed-minimal.js` in backend folder
- Check that you're using the correct credentials from the table above
- Clear browser cookies and try again

---

## 📁 Project Structure

```
ZNHS_Proj-2.0/
├── backend/              # Node.js/Express server
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication, file upload
│   ├── config/          # Database connection
│   ├── uploads/         # Uploaded files
│   ├── .env             # Environment variables (create this)
│   ├── server.js        # Main server file
│   └── package.json     # Dependencies
│
├── frontend/            # Next.js application
│   ├── app/            # Pages and routes
│   ├── components/     # Reusable React components
│   ├── context/        # Authentication context
│   ├── utils/          # Helper functions
│   ├── .env.local      # Environment variables (create this)
│   └── package.json    # Dependencies
│
└── README.md           # This file
```

---

## 🔐 Important Security Notes

⚠️ **For Development Only**:
- Never commit `.env` files to GitHub
- Never use weak passwords in production
- The admin password in seed scripts is for demo purposes only
- In production, use proper environment variables and secret management

---

## 📖 Common Tasks

### Change Default Credentials
1. Log in as admin
2. Go to Profile → Change Password
3. Update your password

### View Database
1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Login with your account
3. Click your cluster → "Collections" to see all data



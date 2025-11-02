# ZNHS AIMS Backend API

Backend API for Zaragoza National High School - Academic Information Management System

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following:

```
MONGODB_URI="mongodb+srv://yurisuncheeze27_db_user:xSmOubII6ILA9wF4@cluster0.fkqcwiq.mongodb.net/?appName=Cluster0"
JWT_SECRET="znhs_aims_secret_key_2025_secure_token"
PORT=5000
NODE_ENV=development
```

### 3. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login (student/staff)
- `GET /api/auth/me` - Get current user profile

### Students
- `GET /api/students` - Get all students (Staff/Admin)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (Admin)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin)
- `GET /api/students/:id/grades` - Get student grades
- `GET /api/students/:id/attendance` - Get student attendance
- `PUT /api/students/:id/reset-password` - Reset password (Admin)

### Staff
- `GET /api/staff` - Get all staff (Admin)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff (Admin)
- `PUT /api/staff/:id` - Update staff (Admin)
- `DELETE /api/staff/:id` - Delete staff (Admin)

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades/:id` - Get grade by ID
- `POST /api/grades` - Create grade (Staff/Admin)
- `PUT /api/grades/:id` - Update grade (Staff/Admin)
- `PUT /api/grades/bulk` - Bulk update grades (Staff/Admin)
- `DELETE /api/grades/:id` - Delete grade (Admin)

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `POST /api/attendance` - Create attendance (Staff/Admin)
- `POST /api/attendance/bulk` - Bulk create attendance (Staff/Admin)
- `PUT /api/attendance/:id` - Update attendance (Staff/Admin)
- `DELETE /api/attendance/:id` - Delete attendance (Admin)
- `GET /api/attendance/stats/:studentId` - Get attendance statistics

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Staff/Admin)
- `PUT /api/events/:id` - Update event (Staff/Admin)
- `DELETE /api/events/:id` - Delete event (Staff/Admin)

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create announcement (Staff/Admin)
- `PUT /api/announcements/:id` - Update announcement (Staff/Admin)
- `DELETE /api/announcements/:id` - Delete announcement (Staff/Admin)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Collections

- **students** - Student accounts and information
- **staff** - Teacher and admin accounts
- **grades** - Student grades by subject and quarter
- **attendance** - Student attendance records
- **events** - School events
- **announcements** - School announcements

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- JWT Authentication
- Bcrypt Password Hashing


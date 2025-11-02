# ZNHS Academic Information Management System (AIMS)

Isang comprehensive school management system para sa **Zaragoza National High School** na may Student Portal, Staff Portal, at Admin Dashboard.

## 🚀 Features

### Para sa Students
- ✅ View grades by quarter and subject
- 📅 Track attendance records
- 📚 Access subject materials
- 📢 View announcements and events
- 👤 Manage profile settings
- 📄 Export grades to PDF

### Para sa Staff (Teachers)
- 📝 Manage student gradebooks
- ✓ Mark student attendance
- 📢 Post announcements
- 📊 Generate reports
- 👥 View assigned sections

### Para sa Admins
- 👥 Manage students (CRUD operations)
- 👨‍🏫 Manage staff members
- 📅 Manage school events
- ⚙️ System settings and configuration
- 📊 View system statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **Axios** - API requests
- **jsPDF** - PDF export

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Git

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
MONGODB_URI="mongodb+srv://yurisuncheeze27_db_user:xSmOubII6ILA9wF4@cluster0.fkqcwiq.mongodb.net/?appName=Cluster0"
JWT_SECRET="znhs_aims_secret_key_2025_secure_token"
PORT=5000
NODE_ENV=development
```

Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file in frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔑 Demo Credentials

### Student Account
- **Email:** student@test.com
- **Password:** password123

### Teacher Account
- **Email:** teacher@test.com
- **Password:** password123

### Admin Account
- **Email:** admin@test.com
- **Password:** password123

> **Note:** You need to create these accounts first using the registration or admin panel.

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - Register new student
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
```

### Student Endpoints
```
GET /api/students - Get all students
GET /api/students/:id - Get student by ID
POST /api/students - Create student
PUT /api/students/:id - Update student
DELETE /api/students/:id - Delete student
GET /api/students/:id/grades - Get student grades
GET /api/students/:id/attendance - Get student attendance
```

### Full API documentation available in `backend/README.md`

## 🎨 UI Design

- **Blue Gradient Theme** (#0033cc → #4da6ff)
- **Glassmorphism** effects for login and cards
- **Responsive** mobile-first design
- **Poppins** font family
- **Clean and modern** interface

## 📁 Project Structure

```
ZNHS proj/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── app/
    │   ├── admin/
    │   ├── staff/
    │   ├── student/
    │   ├── login/
    │   └── register/
    ├── components/
    ├── context/
    └── utils/
```

## 🚀 Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Connect to Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation and sanitization

## 📝 License

This project is for educational purposes for Zaragoza National High School.

## 👨‍💻 Developer

Built with ❤️ for ZNHS

---

## 🆘 Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct
- Ensure port 5000 is not in use
- Run `npm install` to install dependencies

### Frontend won't connect to API
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check browser console for errors

### Can't login
- Verify credentials
- Check if user exists in database
- Ensure JWT_SECRET is set in backend

## 📞 Support

Para sa questions o issues, contact the school IT department.

**Zaragoza National High School**
📧 info@znhs.edu.ph
📞 (044) 123-4567


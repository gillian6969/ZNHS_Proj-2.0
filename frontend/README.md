# ZNHS AIMS Frontend

Next.js frontend application for Zaragoza National High School Academic Information Management System.

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── admin/              # Admin dashboard pages
│   ├── staff/              # Staff/teacher pages
│   ├── student/            # Student portal pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── globals.css         # Global styles
│   └── layout.js           # Root layout
├── components/             # Reusable components
│   ├── Card.js
│   ├── DashboardLayout.js
│   ├── Footer.js
│   ├── Loading.js
│   ├── Modal.js
│   ├── Navbar.js
│   ├── ProtectedRoute.js
│   ├── Sidebar.js
│   └── Table.js
├── context/                # React Context
│   └── AuthContext.js      # Authentication state
└── utils/                  # Utility functions
    ├── api.js              # API client
    └── exportUtils.js      # PDF/CSV export functions
```

## 🎨 Styling

- **TailwindCSS** for utility-first styling
- **Glassmorphism** effects
- **Blue gradient** theme (#0033cc → #4da6ff)
- **Poppins** and **Inter** fonts
- **Responsive** mobile-first design

## 🔐 Authentication

- JWT token stored in `localStorage`
- Protected routes with `ProtectedRoute` component
- Role-based access (student, teacher, admin)
- Auto-redirect on unauthorized access

## 📦 Key Dependencies

- `next` - React framework
- `react` & `react-dom` - UI library
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `jspdf` & `jspdf-autotable` - PDF generation
- `recharts` - Charts (optional)

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy!

### Other Platforms

Build the project:
```bash
npm run build
```

The `out/` or `.next/` folder contains the production build.

## 📱 Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Student registration
- `/forgot-password` - Password reset

### Student Routes (Protected)
- `/student/dashboard`
- `/student/grades`
- `/student/subjects`
- `/student/attendance`
- `/student/profile`

### Staff Routes (Protected)
- `/staff/dashboard`
- `/staff/gradebook`
- `/staff/attendance`
- `/staff/announcements`
- `/staff/profile`

### Admin Routes (Protected)
- `/admin/dashboard`
- `/admin/students`
- `/admin/staff`
- `/admin/events`
- `/admin/settings`

## 🎯 Features

### Student Features
- ✅ View grades (all quarters)
- 📊 Attendance tracking with stats
- 📚 Subject materials access
- 📢 View announcements
- 📄 Export grades to PDF
- 👤 Profile management

### Staff Features
- 📝 Manage gradebook (add/edit grades)
- ✓ Mark attendance (bulk operations)
- 📢 Post announcements
- 📊 View student data
- 👥 Section management

### Admin Features
- 👥 Full student CRUD
- 👨‍🏫 Staff management
- 📅 Event management
- 🔑 Password reset for users
- ⚙️ System settings
- 📊 Dashboard with statistics

## 🛠️ Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```js
colors: {
  primary: {
    dark: '#0033cc',
    light: '#4da6ff',
  },
}
```

### Add New Pages

1. Create file in `app/` directory
2. Use `ProtectedRoute` for auth
3. Use `DashboardLayout` for consistent UI

### Modify API Endpoints

Edit `utils/api.js` to add/modify API calls.

## 📝 Notes

- This is a Next.js 14 project using App Router
- All API calls require authentication (except login/register)
- PDF export uses `jspdf` library
- Responsive design works on mobile/tablet/desktop

## 🆘 Common Issues

### API not connecting
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check browser console for CORS errors

### Authentication not working
- Clear localStorage and try again
- Verify token in localStorage
- Check API response in Network tab

### Build errors
- Delete `.next/` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📧 Support

Contact IT Department:
- Email: info@znhs.edu.ph
- Phone: (044) 123-4567


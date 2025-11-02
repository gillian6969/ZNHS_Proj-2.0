# Major Update Progress - Modern Minimalist Redesign

## ✅ COMPLETED

### Backend
- [x] Class model: Removed `name` field, auto-generate as `gradeLevel + section`
- [x] Staff model: Changed to single `subject` (not array)
- [x] File upload support with multer
- [x] Material model: File uploads (PDF, DOCX, PPTX, MP4)
- [x] Submission model: File uploads (images, PDF, DOCX)
- [x] Database seeded with only admin + 1 teacher
- [x] Server configured for static file serving

### Frontend - Core Components
- [x] Icon component (minimalist solid icons)
- [x] ModernSidebar component (collapsible with burger menu)
- [x] Global CSS (modern minimalist, smaller fonts)

## 🚧 IN PROGRESS

### Pages to Redesign (Using New Sidebar + Icons)
- [ ] Student Dashboard
- [ ] Student Grades
- [ ] Student Subjects
- [ ] Student Attendance
- [ ] Student Profile

- [ ] Staff/Teacher Dashboard
- [ ] Staff Gradebook (with subject filtering)
- [ ] Staff Attendance
- [ ] Staff Materials (with file upload)
- [ ] Staff Announcements
- [ ] Staff Profile

- [ ] Admin Dashboard
- [ ] Admin Students (add grade column, filters, view modal)
- [ ] Admin Staff
- [ ] Admin Class Assignment (simplified)
- [ ] Admin Events

### Specific Features to Add
- [ ] Admin Students: Grade column in table
- [ ] Admin Students: Filter by grade and section
- [ ] Admin Students: View button with student info modal
- [ ] Staff Gradebook: Only show teacher's subject
- [ ] Staff Gradebook: Can only edit their subject grades
- [ ] Staff Materials: File upload (not URL)
- [ ] Student Subjects: File submissions
- [ ] Class Assignment: Simplified (grade, section, room, teachers)

## 📋 REQUIRED CHANGES

### Menu Items Structure
Each role needs updated menu with icon names:
```javascript
const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];
```

### File Upload Flow
1. **Teacher uploads material:**
   - Select file (PDF, DOCX, PPTX, MP4)
   - Upload to backend `/api/materials` with FormData
   - Backend saves to `uploads/materials/`
   - Returns file path

2. **Student submits:**
   - Select file (PDF, DOCX, JPG, PNG)
   - Upload to `/api/submissions` with FormData
   - Backend saves to `uploads/submissions/`

### Database Rules
- Each teacher has ONLY 1 subject
- Teachers can ONLY edit grades for their own subject
- Students auto-assign to class based on grade+section match
- Class name auto-generated (no manual input)

## 🎨 Design Standards

### Typography
- H1: `text-2xl font-bold`
- H2: `text-xl font-semibold`
- H3: `text-lg font-semibold`
- Body: `text-sm`

### Buttons
- Primary: `btn-primary` (blue)
- Secondary: `btn-secondary` (gray)
- Danger: `btn-danger` (red)
- Success: `btn-success` (green)

### Cards
- Use: `.card` class
- Padding: `p-5` (not p-6)
- Shadow: `shadow-sm` (not shadow-md)

### Spacing
- Section margins: `mb-5` or `mb-6`
- Element gaps: `gap-4`

## Demo Accounts

```
Admin:
  Email: admin@znhs.edu.ph
  Password: Admin123!

Teacher:
  Email: teacher@znhs.edu.ph
  Password: Teacher123!
  Subject: Mathematics
```

## Next Steps

1. Update all dashboard pages to use ModernSidebar
2. Replace all emoji icons with Icon component
3. Implement file upload for materials/submissions
4. Add grade column and filters to Admin Students page
5. Restrict gradebook by teacher's subject
6. Simplify Class Assignment page

---

**Status:** Backend complete, Frontend in progress (50%)
**ETA:** Multiple components need updates


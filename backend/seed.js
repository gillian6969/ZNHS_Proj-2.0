import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Staff from './models/Staff.js';
import Grade from './models/Grade.js';
import Attendance from './models/Attendance.js';
import Event from './models/Event.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'znhs_aims',
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Grade.deleteMany({});
    await Attendance.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});
    console.log('✅ Data cleared\n');

    // Create password hashes
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // ===== CREATE ADMIN ACCOUNT =====
    console.log('👨‍💼 Creating Admin account...');
    const admin = await Staff.create({
      name: 'Admin User',
      email: 'admin@znhs.edu.ph',
      idNumber: 'ADMIN001',
      passwordHash: hashedPassword,
      role: 'admin',
      subject: 'Administration',
      contact: '09171234567',
      assignedSections: ['Grade 10-A', 'Grade 10-B', 'Grade 11-A'],
    });
    console.log('✅ Admin created:', admin.email);

    // ===== CREATE TEACHER ACCOUNTS =====
    console.log('\n👨‍🏫 Creating Teacher accounts...');
    const teacher1 = await Staff.create({
      name: 'Maria Santos',
      email: 'teacher@znhs.edu.ph',
      idNumber: 'TEACH001',
      passwordHash: hashedPassword,
      role: 'teacher',
      subject: 'Mathematics',
      contact: '09181234567',
      assignedSections: ['Grade 10-A', 'Grade 10-B'],
    });

    const teacher2 = await Staff.create({
      name: 'Juan Cruz',
      email: 'juan.cruz@znhs.edu.ph',
      idNumber: 'TEACH002',
      passwordHash: hashedPassword,
      role: 'teacher',
      subject: 'English',
      contact: '09191234567',
      assignedSections: ['Grade 10-A'],
    });

    console.log('✅ Teachers created:', teacher1.email, teacher2.email);

    // ===== CREATE STUDENT ACCOUNTS =====
    console.log('\n👨‍🎓 Creating Student accounts...');
    const students = [];

    const studentData = [
      { name: 'Juan Dela Cruz', email: 'student@znhs.edu.ph', idNumber: 'STU2024001', section: 'Grade 10-A' },
      { name: 'Maria Garcia', email: 'maria.garcia@student.znhs.edu.ph', idNumber: 'STU2024002', section: 'Grade 10-A' },
      { name: 'Pedro Reyes', email: 'pedro.reyes@student.znhs.edu.ph', idNumber: 'STU2024003', section: 'Grade 10-A' },
      { name: 'Ana Santos', email: 'ana.santos@student.znhs.edu.ph', idNumber: 'STU2024004', section: 'Grade 10-B' },
      { name: 'Jose Mendoza', email: 'jose.mendoza@student.znhs.edu.ph', idNumber: 'STU2024005', section: 'Grade 10-B' },
    ];

    for (const data of studentData) {
      const student = await Student.create({
        ...data,
        passwordHash: hashedPassword,
        contact: '09123456789',
        address: 'Zaragoza, Nueva Ecija',
      });
      students.push(student);
      console.log('✅ Student created:', student.email);
    }

    // ===== CREATE SAMPLE GRADES =====
    console.log('\n📝 Creating sample grades...');
    const subjects = ['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Research'];
    
    for (const student of students) {
      for (const subject of subjects) {
        const q1 = Math.floor(Math.random() * 16) + 80; // 80-95
        const q2 = Math.floor(Math.random() * 16) + 80;
        const q3 = Math.floor(Math.random() * 16) + 80;
        const q4 = Math.floor(Math.random() * 16) + 80;
        const final = Math.round((q1 + q2 + q3 + q4) / 4);

        await Grade.create({
          studentId: student._id,
          subject,
          q1,
          q2,
          q3,
          q4,
          final,
          schoolYear: '2024-2025',
          createdBy: teacher1._id,
        });
      }
    }
    console.log('✅ Grades created for all students');

    // ===== CREATE SAMPLE ATTENDANCE =====
    console.log('\n📅 Creating sample attendance...');
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent']; // More present
    const dates = [];
    
    // Generate last 20 school days
    for (let i = 20; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        dates.push(date);
      }
    }

    for (const student of students) {
      for (const date of dates) {
        await Attendance.create({
          studentId: student._id,
          date,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          subject: 'General',
          markedBy: teacher1._id,
        });
      }
    }
    console.log('✅ Attendance records created');

    // ===== CREATE SAMPLE EVENTS =====
    console.log('\n📅 Creating sample events...');
    const events = [
      {
        title: 'Foundation Day Celebration',
        description: 'Annual celebration of school founding with cultural presentations and competitions.',
        date: new Date('2025-02-15'),
        visibility: 'all',
        createdBy: admin._id,
      },
      {
        title: 'Parent-Teacher Conference',
        description: 'Meeting with parents to discuss student progress and academic performance.',
        date: new Date('2025-01-20'),
        visibility: 'all',
        createdBy: admin._id,
      },
      {
        title: 'Science Fair',
        description: 'Annual science fair showcasing student projects and innovations.',
        date: new Date('2025-03-10'),
        visibility: 'students',
        createdBy: teacher1._id,
      },
      {
        title: 'Sports Fest 2025',
        description: 'Inter-section sports competition and athletic events.',
        date: new Date('2025-04-05'),
        visibility: 'all',
        createdBy: admin._id,
      },
    ];

    for (const event of events) {
      await Event.create(event);
    }
    console.log('✅ Events created');

    // ===== CREATE SAMPLE ANNOUNCEMENTS =====
    console.log('\n📢 Creating sample announcements...');
    const announcements = [
      {
        title: 'Reminder: Midterm Examinations',
        body: 'Midterm exams will be held next week, January 15-19. Please review all modules and come prepared. Good luck to all students!',
        visibility: 'students',
        createdBy: admin._id,
      },
      {
        title: 'School Uniform Reminder',
        body: 'Please ensure students are wearing proper school uniforms. Name tags are required at all times within the campus.',
        visibility: 'all',
        createdBy: admin._id,
      },
      {
        title: 'Teacher Meeting - This Friday',
        body: 'All teachers are required to attend the faculty meeting this Friday at 3:00 PM in the Conference Room.',
        visibility: 'staff',
        createdBy: admin._id,
      },
    ];

    for (const announcement of announcements) {
      await Announcement.create(announcement);
    }
    console.log('✅ Announcements created');

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   • ${await Staff.countDocuments()} Staff members`);
    console.log(`   • ${await Student.countDocuments()} Students`);
    console.log(`   • ${await Grade.countDocuments()} Grade records`);
    console.log(`   • ${await Attendance.countDocuments()} Attendance records`);
    console.log(`   • ${await Event.countDocuments()} Events`);
    console.log(`   • ${await Announcement.countDocuments()} Announcements`);
    console.log('\n🔑 Demo Login Credentials:\n');
    console.log('   ADMIN:');
    console.log('   • Email: admin@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('   TEACHER:');
    console.log('   • Email: teacher@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('   STUDENT:');
    console.log('   • Email: student@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run the seed
connectDB().then(seedDatabase);


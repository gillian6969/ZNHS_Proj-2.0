import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Staff from './models/Staff.js';
import Grade from './models/Grade.js';
import Attendance from './models/Attendance.js';
import Event from './models/Event.js';
import Announcement from './models/Announcement.js';
import Class from './models/Class.js';
import Material from './models/Material.js';
import Submission from './models/Submission.js';

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
    console.log('🌱 Starting database seed with NEW STRUCTURE...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Grade.deleteMany({});
    await Attendance.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});
    await Class.deleteMany({});
    await Material.deleteMany({});
    await Submission.deleteMany({});
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
      subjects: ['Administration'],
      contact: '09171234567',
      assignedClasses: [],
    });
    console.log('✅ Admin created:', admin.email);

    // ===== CREATE TEACHER ACCOUNTS =====
    console.log('\n👨‍🏫 Creating Teacher accounts...');
    const teachers = [];
    
    const teachersData = [
      { name: 'Maria Santos', email: 'maria.santos@znhs.edu.ph', idNumber: 'TEACH001', subjects: ['Mathematics', 'Statistics'] },
      { name: 'Juan Cruz', email: 'juan.cruz@znhs.edu.ph', idNumber: 'TEACH002', subjects: ['English', 'Literature'] },
      { name: 'Pedro Reyes', email: 'pedro.reyes@znhs.edu.ph', idNumber: 'TEACH003', subjects: ['Science', 'Physics'] },
      { name: 'Ana Garcia', email: 'ana.garcia@znhs.edu.ph', idNumber: 'TEACH004', subjects: ['Filipino', 'AP'] },
      { name: 'Jose Mendoza', email: 'jose.mendoza@znhs.edu.ph', idNumber: 'TEACH005', subjects: ['TLE', 'Computer'] },
    ];

    for (const data of teachersData) {
      const teacher = await Staff.create({
        ...data,
        passwordHash: hashedPassword,
        role: 'teacher',
        contact: '09181234567',
        assignedClasses: [],
      });
      teachers.push(teacher);
      console.log('✅ Teacher created:', teacher.email);
    }

    // ===== CREATE CLASSES =====
    console.log('\n📚 Creating Classes...');
    const classes = [];
    
    const classesData = [
      { gradeLevel: 'Grade 7', section: 'Section A', className: 'Grade 7 - Section A' },
      { gradeLevel: 'Grade 7', section: 'Section B', className: 'Grade 7 - Section B' },
      { gradeLevel: 'Grade 10', section: 'Section A', className: 'Grade 10 - Section A' },
      { gradeLevel: 'Grade 10', section: 'Section B', className: 'Grade 10 - Section B' },
      { gradeLevel: 'Grade 11', section: 'Section STEM', className: 'Grade 11 - STEM' },
    ];

    for (const data of classesData) {
      const classTeachers = [
        { teacherId: teachers[0]._id, subject: 'Mathematics' },
        { teacherId: teachers[1]._id, subject: 'English' },
        { teacherId: teachers[2]._id, subject: 'Science' },
        { teacherId: teachers[3]._id, subject: 'Filipino' },
        { teacherId: teachers[4]._id, subject: 'TLE' },
      ];

      const newClass = await Class.create({
        ...data,
        schoolYear: '2024-2025',
        teachers: classTeachers,
        students: [],
        room: `Room ${Math.floor(Math.random() * 20) + 101}`,
      });
      classes.push(newClass);

      // Update teachers' assignedClasses
      await Staff.updateMany(
        { _id: { $in: classTeachers.map(t => t.teacherId) } },
        { $push: { assignedClasses: newClass._id } }
      );

      console.log('✅ Class created:', newClass.className);
    }

    // ===== CREATE STUDENT ACCOUNTS =====
    console.log('\n👨‍🎓 Creating Student accounts...');
    const students = [];

    const studentsData = [
      // Grade 7 Section A
      { name: 'Juan Dela Cruz', email: 'student@znhs.edu.ph', idNumber: 'STU2024001', gradeLevel: 'Grade 7', section: 'Section A', classIndex: 0 },
      { name: 'Maria Gonzales', email: 'maria.gonzales@student.znhs.edu.ph', idNumber: 'STU2024002', gradeLevel: 'Grade 7', section: 'Section A', classIndex: 0 },
      { name: 'Pedro Santos', email: 'pedro.santos@student.znhs.edu.ph', idNumber: 'STU2024003', gradeLevel: 'Grade 7', section: 'Section A', classIndex: 0 },
      // Grade 7 Section B
      { name: 'Ana Lopez', email: 'ana.lopez@student.znhs.edu.ph', idNumber: 'STU2024004', gradeLevel: 'Grade 7', section: 'Section B', classIndex: 1 },
      { name: 'Jose Rivera', email: 'jose.rivera@student.znhs.edu.ph', idNumber: 'STU2024005', gradeLevel: 'Grade 7', section: 'Section B', classIndex: 1 },
      // Grade 10 Section A
      { name: 'Sofia Martinez', email: 'sofia.martinez@student.znhs.edu.ph', idNumber: 'STU2024006', gradeLevel: 'Grade 10', section: 'Section A', classIndex: 2 },
      { name: 'Miguel Torres', email: 'miguel.torres@student.znhs.edu.ph', idNumber: 'STU2024007', gradeLevel: 'Grade 10', section: 'Section A', classIndex: 2 },
      // Grade 10 Section B
      { name: 'Isabella Ramos', email: 'isabella.ramos@student.znhs.edu.ph', idNumber: 'STU2024008', gradeLevel: 'Grade 10', section: 'Section B', classIndex: 3 },
      { name: 'Carlos Diaz', email: 'carlos.diaz@student.znhs.edu.ph', idNumber: 'STU2024009', gradeLevel: 'Grade 10', section: 'Section B', classIndex: 3 },
      // Grade 11 STEM
      { name: 'Andrea Cruz', email: 'andrea.cruz@student.znhs.edu.ph', idNumber: 'STU2024010', gradeLevel: 'Grade 11', section: 'Section STEM', classIndex: 4 },
    ];

    for (const data of studentsData) {
      const { classIndex, ...studentData } = data;
      const student = await Student.create({
        ...studentData,
        passwordHash: hashedPassword,
        contact: '09123456789',
        address: 'Zaragoza, Nueva Ecija',
        classId: classes[classIndex]._id,
      });
      students.push(student);

      // Add student to class
      await Class.findByIdAndUpdate(
        classes[classIndex]._id,
        { $push: { students: student._id } }
      );

      console.log('✅ Student created:', student.email, `(${student.gradeLevel} - ${student.section})`);
    }

    // ===== CREATE SAMPLE GRADES =====
    console.log('\n📝 Creating sample grades...');
    const subjects = ['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'TLE', 'MAPEH', 'Research'];
    
    for (const student of students) {
      for (const subject of subjects) {
        const q1 = Math.floor(Math.random() * 16) + 80;
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
          createdBy: teachers[0]._id,
        });
      }
    }
    console.log('✅ Grades created for all students');

    // ===== CREATE SAMPLE ATTENDANCE =====
    console.log('\n📅 Creating sample attendance...');
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
    const dates = [];
    
    for (let i = 20; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
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
          markedBy: teachers[0]._id,
        });
      }
    }
    console.log('✅ Attendance records created');

    // ===== CREATE LEARNING MATERIALS =====
    console.log('\n📚 Creating learning materials...');
    for (const classItem of classes) {
      for (const teacher of classItem.teachers) {
        await Material.create({
          title: `${teacher.subject} - Module 1`,
          description: `Introduction to ${teacher.subject}`,
          type: 'document',
          fileUrl: '/materials/sample-module.pdf',
          fileName: `${teacher.subject}-module-1.pdf`,
          subject: teacher.subject,
          classId: classItem._id,
          uploadedBy: teacher.teacherId,
        });
      }
    }
    console.log('✅ Learning materials created');

    // ===== CREATE SAMPLE EVENTS =====
    console.log('\n📅 Creating sample events...');
    const events = [
      {
        title: 'Foundation Day Celebration',
        description: 'Annual celebration of school founding with cultural presentations.',
        date: new Date('2025-02-15'),
        visibility: 'all',
        createdBy: admin._id,
      },
      {
        title: 'Midterm Examinations',
        description: 'Midterm exams for all grade levels.',
        date: new Date('2025-01-15'),
        visibility: 'students',
        createdBy: admin._id,
      },
      {
        title: 'Science Fair 2025',
        description: 'Annual science fair showcasing student projects.',
        date: new Date('2025-03-10'),
        visibility: 'all',
        createdBy: teachers[2]._id,
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
        body: 'Midterm exams will be held next week. Please review all modules and come prepared.',
        visibility: 'students',
        createdBy: admin._id,
      },
      {
        title: 'School Uniform Reminder',
        body: 'Please ensure students are wearing proper school uniforms.',
        visibility: 'all',
        createdBy: admin._id,
      },
    ];

    for (const announcement of announcements) {
      await Announcement.create(announcement);
    }
    console.log('✅ Announcements created');

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY WITH NEW STRUCTURE!\n');
    console.log('📊 Summary:');
    console.log(`   • ${await Staff.countDocuments()} Staff members (1 Admin, ${teachers.length} Teachers)`);
    console.log(`   • ${await Student.countDocuments()} Students`);
    console.log(`   • ${await Class.countDocuments()} Classes`);
    console.log(`   • ${await Grade.countDocuments()} Grade records`);
    console.log(`   • ${await Attendance.countDocuments()} Attendance records`);
    console.log(`   • ${await Material.countDocuments()} Learning materials`);
    console.log(`   • ${await Event.countDocuments()} Events`);
    console.log(`   • ${await Announcement.countDocuments()} Announcements`);
    console.log('\n🔑 Demo Login Credentials:\n');
    console.log('   ADMIN:');
    console.log('   • Email: admin@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('   TEACHER:');
    console.log('   • Email: maria.santos@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('   STUDENT:');
    console.log('   • Email: student@znhs.edu.ph');
    console.log('   • Password: password123\n');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run the seed
connectDB().then(seedDatabase);


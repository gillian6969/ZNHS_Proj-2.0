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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://znhsreservation:yX8gjCdHxTuJ1fZB@cluster0.0tz15.mongodb.net/znhs-aims?retryWrites=true&w=majority&appName=Cluster0';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear ALL collections completely
    console.log('🗑️  Clearing ALL database collections...');
    
    // Drop all collections to ensure clean slate
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`   ✓ Cleared: ${collection.collectionName}`);
    }
    
    console.log('✅ All data cleared from database');

    // Create ONLY Admin Account
    console.log('👤 Creating Admin account...');
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await Staff.create({
      name: 'System Administrator',
      email: 'admin@znhs.edu.ph',
      idNumber: 'ADM-2024-001',
      passwordHash: adminPassword,
      role: 'admin',
      subject: 'Administration',
      contact: '09123456789',
      assignedClasses: [],
    });
    console.log('✅ Admin account created');

    console.log('');
    console.log('🎉 Database reset successfully!');
    console.log('');
    console.log('=== ADMIN ACCOUNT ===');
    console.log('');
    console.log('Email: admin@znhs.edu.ph');
    console.log('Password: Admin123!');
    console.log('');
    console.log('⚠️  ALL other data has been deleted.');
    console.log('   - No students');
    console.log('   - No teachers');
    console.log('   - No classes');
    console.log('   - No grades');
    console.log('   - No attendance records');
    console.log('   - No events');
    console.log('   - No announcements');
    console.log('   - No materials');
    console.log('   - No submissions');
    console.log('');
    console.log('Admin can create all other data via dashboard.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


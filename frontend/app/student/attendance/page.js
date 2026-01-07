'use client';

import Icon from '@/components/Icon';
import Loading from '@/components/Loading';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { attendanceAPI, classAPI } from '@/utils/api';
import { useEffect, useState } from 'react';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Learning Material', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Announcements', href: '/student/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user) {
      Promise.all([fetchAttendance(), fetchClassData()]);
    }
  }, [user]);

  useEffect(() => {
    console.log('ClassData loaded:', classData);
  }, [classData]);

  const fetchAttendance = async () => {
    try {
      const { data } = await attendanceAPI.getAll({ studentId: user._id });
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassData = async () => {
    try {
      // Use classId instead of class
      if (user.classId) {
        const { data } = await classAPI.getById(user.classId);
        setClassData(data);
        console.log('Fetched class data:', data);
      } else {
        console.log('User does not have a classId:', user);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const calculateStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    const total = attendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, late, absent, excused, total, rate };
  };

  const getUniquTeachers = () => {
    const teachers = attendance.reduce((acc, record) => {
      if (record.markedBy && record.markedBy._id) {
        if (!acc.find(t => t._id === record.markedBy._id)) {
          acc.push(record.markedBy);
        }
      }
      return acc;
    }, []);
    return teachers.sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
  };

  const getUniqueSubjects = () => {
    // Get subjects from class data instead of attendance records
    const classSubjects = classData?.teachers?.map(t => t.subject) || [];
    return classSubjects.sort();
  };

  const handlePreviousDate = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Helper function to safely compare dates without timezone issues
  const getDateString = (dateInput) => {
    if (typeof dateInput === 'string') {
      // If it's already a string like "2025-01-08", return as-is
      return dateInput.split('T')[0];
    }
    // If it's a Date object, extract the date in Manila timezone (UTC+8)
    const d = new Date(dateInput);
    // Add 8 hours to convert from UTC to Manila time
    d.setHours(d.getHours() + 8);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAttendanceForSelectedDate = () => {
    // Get all subjects from class
    const classSubjects = classData?.teachers?.map(t => t.subject) || [];
    
    // If no class subjects, return empty array
    if (classSubjects.length === 0) {
      return [];
    }
    
    // Get attendance records for the selected date
    const dateAttendance = attendance.filter(a => {
      const recordDate = getDateString(a.date);
      return recordDate === selectedDate;
    });

    // Create a map of subjects with attendance
    const attendanceMap = {};
    dateAttendance.forEach(record => {
      attendanceMap[record.subject] = record;
    });

    // Create array with all subjects, using placeholders for missing attendance
    const completeAttendance = classSubjects.map(subject => {
      if (attendanceMap[subject]) {
        return attendanceMap[subject];
      } else {
        // Create placeholder record for subjects without attendance
        return {
          _id: `placeholder-${subject}-${selectedDate}`,
          subject: subject,
          status: 'not-marked',
          date: new Date(selectedDate),
          isPlaceholder: true,
        };
      }
    });

    return completeAttendance;
  };

  const filteredAttendance = (() => {
    const dateAttendance = getAttendanceForSelectedDate();
    
    return dateAttendance.filter(a => {
      const statusMatch = statusFilter === 'all' || a.status === statusFilter || a.status === 'not-marked';
      const subjectMatch = subjectFilter === 'all' || a.subject === subjectFilter;
      return statusMatch && subjectMatch;
    });
  })();

  const stats = calculateStats();

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="My Attendance">

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Attendance Rate</p>
                <h2 className="text-2xl font-bold text-blue-600">{stats.rate}%</h2>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Present</p>
                <h2 className="text-2xl font-bold text-green-600">{stats.present}</h2>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Late</p>
                <h2 className="text-2xl font-bold text-yellow-600">{stats.late}</h2>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Absent</p>
                <h2 className="text-2xl font-bold text-red-600">{stats.absent}</h2>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 mb-1">Excused</p>
                <h2 className="text-2xl font-bold text-blue-500">{stats.excused}</h2>
              </div>
            </div>

            {/* Filter */}
            <div className="card mb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="input-label">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="input-label">Filter by Subject</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Subjects ({getUniqueSubjects().length})</option>
                    {getUniqueSubjects().map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selector */}
                <div>
                  <label className="input-label">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                    title="Select date"
                  />
                </div>

                {/* Navigation Buttons */}
                <div>
                  <label className="input-label">Navigation</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousDate}
                      className="flex-1 p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                      title="Previous date"
                    >
                      <Icon name="chevron-left" className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleToday}
                      className="flex-1 p-2 hover:bg-blue-100 rounded-lg transition-colors border border-blue-300"
                      title="Go to today"
                    >
                      <Icon name="restart" className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNextDate}
                      className="flex-1 p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                      title="Next date"
                    >
                      <Icon name="chevron-right" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(selectedDate).toLocaleDateString()}</td>
                        <td>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td>{record.subject || 'General'}</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'present' ? 'badge-success' :
                            record.status === 'late' ? 'badge-warning' :
                            record.status === 'excused' ? 'badge-info' :
                            record.status === 'not-marked' ? 'badge-secondary' :
                            'badge-danger'
                          }`}>
                            {record.status === 'not-marked' ? 'NOT MARKED' : record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

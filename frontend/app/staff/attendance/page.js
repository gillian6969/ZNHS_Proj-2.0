'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { classAPI, attendanceAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const staffMenu = [
  { label: 'Dashboard', href: '/staff/dashboard', iconName: 'dashboard' },
  { label: 'Gradebook', href: '/staff/gradebook', iconName: 'grades' },
  { label: 'Attendance', href: '/staff/attendance', iconName: 'calendar' },
  { label: 'Materials', href: '/staff/materials', iconName: 'book' },
  { label: 'Announcements', href: '/staff/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StaffAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const classData = await classAPI.getById(selectedClass);
      setStudents(classData.data.students);
      
      // Initialize attendance with 'present'
      const initialAttendance = {};
      classData.data.students.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        date: date,
        status: attendance[student._id] || 'present',
      }));

      await Promise.all(
        attendanceRecords.map(record => attendanceAPI.create(record))
      );

      alert('Attendance saved successfully!');
    } catch (error) {
      alert('Failed to save attendance');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>Mark Attendance</h1>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Icon name="save" className="w-4 h-4" />
            Save Attendance
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Controls */}
            <div className="card mb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="input-field"
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={() => handleMarkAll('present')} className="btn-success text-xs flex-1">
                    All Present
                  </button>
                  <button onClick={() => handleMarkAll('absent')} className="btn-danger text-xs flex-1">
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID Number</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="font-medium">{student.idNumber}</td>
                      <td>{student.name}</td>
                      <td>
                        <select
                          value={attendance[student._id] || 'present'}
                          onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                          className="input-field py-1"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
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
  const [existingAttendance, setExistingAttendance] = useState({}); // Track existing record IDs
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({}); // Track which student is currently saving
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && date) {
      fetchExistingAttendance();
    }
  }, [selectedClass, date]);

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
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      if (!selectedClass || !date) return;
      
      const classData = await classAPI.getById(selectedClass);
      const studentIds = classData.data.students.map(s => s._id);
      
      // Fetch existing attendance for all students on this date
      const attendanceMap = {};
      const attendanceIdMap = {};
      
      // Initialize all students with 'present'
      classData.data.students.forEach(student => {
        attendanceMap[student._id] = 'present';
      });
      
      // Fetch existing records
      const promises = studentIds.map(async (studentId) => {
        try {
          const { data } = await attendanceAPI.getAll({ 
            studentId, 
            date: date
          });
          
          if (data && data.length > 0) {
            // Get the record for this specific date (backend now returns correctly filtered)
            const record = data[0]; // Should only be one record for this date after backend fix
            
            if (record) {
              attendanceMap[studentId] = record.status;
              attendanceIdMap[studentId] = record._id;
            }
          }
        } catch (err) {
          console.error(`Error fetching attendance for student ${studentId}:`, err);
        }
      });
      
      await Promise.all(promises);
      setAttendance(attendanceMap);
      setExistingAttendance(attendanceIdMap);
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
    }
  };

  const handleAttendanceChange = useCallback(async (studentId, status) => {
    // Get previous status before updating
    const prevStatus = attendance[studentId] || 'present';
    
    // Update local state immediately for responsive UI
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
    
    setSaving(prev => ({ ...prev, [studentId]: true }));
    
    try {
      // Auto-save the attendance change
      const record = {
        studentId,
        date: date,
        status: status,
      };
      
      await attendanceAPI.create(record);
      
      // Refresh attendance for this student to get updated status
      const { data } = await attendanceAPI.getAll({ 
        studentId, 
        date: date
      });
      
      if (data && data.length > 0) {
        // Find the record for this specific date
        const savedRecord = data.find(a => {
          const recordDate = new Date(a.date).toISOString().split('T')[0];
          return recordDate === date;
        });
        
        if (savedRecord) {
          // Update the attendance status from the saved record
          setAttendance(prev => ({
            ...prev,
            [studentId]: savedRecord.status,
          }));
          
          setExistingAttendance(prev => ({
            ...prev,
            [studentId]: savedRecord._id,
          }));
        }
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      
      // Get student name for error message
      const student = students.find(s => s._id === studentId);
      setToast({ 
        isOpen: true, 
        message: `Failed to save attendance for ${student?.name || 'student'}`, 
        type: 'error' 
      });
      // Revert to previous status on error
      setAttendance(prev => ({
        ...prev,
        [studentId]: prevStatus,
      }));
    } finally {
      setSaving(prev => ({ ...prev, [studentId]: false }));
    }
  }, [date, attendance, students]);

  const handleMarkAll = async (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
    
    // Auto-save all changes
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        date: date,
        status: status,
      }));

      await Promise.all(
        attendanceRecords.map(record => attendanceAPI.create(record))
      );
      
      setToast({ 
        isOpen: true, 
        message: `All students marked as ${status}`, 
        type: 'success' 
      });
      
      // Refresh existing attendance IDs
      await fetchExistingAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setToast({ 
        isOpen: true, 
        message: 'Failed to save attendance', 
        type: 'error' 
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu} pageTitle="Attendance Management">

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
                        <div className="flex items-center gap-2">
                          <select
                            value={attendance[student._id] || 'present'}
                            onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                            className="input-field py-1"
                            disabled={saving[student._id]}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="excused">Excused</option>
                          </select>
                          {saving[student._id] && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      </ModernSidebar>
    </ProtectedRoute>
  );
}

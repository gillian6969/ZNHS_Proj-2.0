'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { attendanceAPI } from '@/utils/api';
import { AttendanceChart } from '@/components/Charts';
import Loading from '@/components/Loading';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user]);

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

  const calculateStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    const total = attendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, late, absent, excused, total, rate };
  };

  const filteredAttendance = filter === 'all' 
    ? attendance 
    : attendance.filter(a => a.status === filter);

  const stats = calculateStats();

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu}>
        <h1 className="mb-5">Attendance Record</h1>

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

            {/* Chart */}
            {attendance.length > 0 && (
              <div className="card mb-5">
                <h3 className="mb-3">Attendance Trend</h3>
                <AttendanceChart
                  data={{
                    labels: attendance.slice(0, 10).reverse().map(a => 
                      new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ),
                    values: attendance.slice(0, 10).reverse().map(a => 
                      a.status === 'present' ? 100 : a.status === 'late' ? 75 : 0
                    ),
                  }}
                />
              </div>
            )}

            {/* Filter */}
            <div className="card mb-5">
              <label className="input-label">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="all">All ({attendance.length})</option>
                <option value="present">Present ({stats.present})</option>
                <option value="late">Late ({stats.late})</option>
                <option value="absent">Absent ({stats.absent})</option>
                <option value="excused">Excused ({stats.excused})</option>
              </select>
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
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td>{record.subject || 'General'}</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'present' ? 'badge-success' :
                            record.status === 'late' ? 'badge-warning' :
                            record.status === 'excused' ? 'badge-info' :
                            'badge-danger'
                          }`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-xs text-gray-600">{record.remarks || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
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

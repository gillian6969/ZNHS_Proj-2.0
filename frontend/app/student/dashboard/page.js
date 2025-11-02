'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { gradeAPI, attendanceAPI, eventAPI } from '@/utils/api';
import Loading from '@/components/Loading';
import { GradesChart, AttendanceChart } from '@/components/Charts';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [gradesRes, attendanceRes, eventsRes] = await Promise.all([
        gradeAPI.getAll({ studentId: user._id }),
        attendanceAPI.getAll({ studentId: user._id }),
        eventAPI.getAll({ upcoming: 'true' }),
      ]);

      setGrades(gradesRes.data);
      setAttendance(attendanceRes.data.slice(0, 7));
      setEvents(eventsRes.data.slice(0, 5));
      
      // Calculate stats
      const present = attendanceRes.data.filter(a => a.status === 'present').length;
      const total = attendanceRes.data.length;
      setAttendanceStats({
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        present,
        total,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + (grade.final || 0), 0);
    return (total / grades.length).toFixed(1);
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu}>
        <h1 className="mb-5">Dashboard</h1>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">General Average</p>
                    <h2 className="text-2xl font-bold text-blue-600">{calculateAverage()}</h2>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="chart" className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Attendance Rate</p>
                    <h2 className="text-2xl font-bold text-green-600">{attendanceStats?.attendanceRate || 0}%</h2>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="calendar" className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Subjects</p>
                    <h2 className="text-2xl font-bold text-purple-600">{grades.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="book" className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Upcoming Events</p>
                    <h2 className="text-2xl font-bold text-orange-600">{events.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon name="event" className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {grades.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-4 mb-5">
                <div className="card">
                  <h3 className="mb-3">Grades Overview</h3>
                  <GradesChart
                    data={{
                      labels: grades.slice(0, 7).map(g => g.subject),
                      values: grades.slice(0, 7).map(g => g.final || 0),
                    }}
                  />
                </div>

                <div className="card">
                  <h3 className="mb-3">Attendance Trend</h3>
                  <AttendanceChart
                    data={{
                      labels: attendance.map(a => 
                        new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      values: attendance.map(a => 
                        a.status === 'present' ? 100 : a.status === 'late' ? 75 : 0
                      ),
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Recent Grades */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Recent Grades</h3>
                  <a href="/student/grades" className="text-xs text-blue-600 hover:text-blue-700">View All</a>
                </div>
                {grades.length > 0 ? (
                  <div className="space-y-2">
                    {grades.slice(0, 5).map((grade) => (
                      <div key={grade._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium">{grade.subject}</span>
                        <span className={`text-sm font-bold ${
                          grade.final >= 90 ? 'text-green-600' :
                          grade.final >= 75 ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {grade.final || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No grades available yet</p>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Upcoming Events</h3>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="event" className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">{event.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{event.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

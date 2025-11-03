'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { gradeAPI, attendanceAPI, eventAPI, announcementAPI } from '@/utils/api';
import Loading from '@/components/Loading';
import { QuarterGradesChart, AttendanceChart, AttendancePieChart } from '@/components/Charts';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Learning Material', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Announcements', href: '/student/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [gradesRes, attendanceRes, eventsRes, announcementsRes] = await Promise.all([
        gradeAPI.getAll({ studentId: user._id }),
        attendanceAPI.getAll({ studentId: user._id }),
        eventAPI.getAll({ upcoming: 'true' }),
        user?.classId ? announcementAPI.getAll({ classId: user.classId }) : Promise.resolve({ data: [] }),
      ]);

      setGrades(gradesRes.data);
      setAttendance(attendanceRes.data.slice(0, 7));
      setEvents(eventsRes.data.slice(0, 5));
      setAnnouncements(announcementsRes.data.slice(0, 3)); // Show latest 3 announcements
      
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="Dashboard">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
          {/* School Logo Watermark */}
          <div className="absolute right-10 left-10 top-0 bottom-0 flex items-center justify-end opacity-[.50] pointer-events-none">
            <img 
              src="/znhslogo.png" 
              alt="ZNHS Logo" 
              className="w-[300%] h-[300%] object-contain translate-x-1/4 -rotate-12"
            />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Welcome back to your academic dashboard
              </p>
            </div>
          </div>
        </div>

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
            <div className="grid lg:grid-cols-2 gap-4 mb-5">
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Quarter Grades Comparison</h3>
                  {grades.length > 0 && selectedSubjects.length > 0 && (
                    <button
                      onClick={() => setSelectedSubjects([])}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Icon name="close" className="w-3 h-3" />
                      Clear Filter
                    </button>
                  )}
                </div>
                {grades.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Filter by subject (optional):</p>
                      <div className="flex flex-wrap gap-2">
                        {grades.map((grade) => (
                          <button
                            key={grade._id}
                            onClick={() => {
                              if (selectedSubjects.includes(grade.subject)) {
                                setSelectedSubjects(selectedSubjects.filter(s => s !== grade.subject));
                              } else {
                                setSelectedSubjects([...selectedSubjects, grade.subject]);
                              }
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                              selectedSubjects.includes(grade.subject)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {grade.subject}
                          </button>
                        ))}
                      </div>
                    </div>
                    <QuarterGradesChart data={grades} selectedSubjects={selectedSubjects} />
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <p>No grades available yet</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3">Attendance Overview</h3>
                {attendance.length > 0 ? (
                  <AttendancePieChart
                    data={{
                      present: attendance.filter(a => a.status === 'present').length,
                      absent: attendance.filter(a => a.status === 'absent').length,
                      late: attendance.filter(a => a.status === 'late').length,
                      excused: attendance.filter(a => a.status === 'excused').length,
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No attendance data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-5">
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

            {/* Announcements Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3>Latest Announcements</h3>
                <a href="/student/announcements" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </a>
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="announcement" className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-gray-900">{announcement.title}</h4>
                          <span className={`badge ${
                            announcement.priority === 'urgent' ? 'badge-danger' :
                            announcement.priority === 'high' ? 'badge-warning' :
                            'badge-info'
                          } text-xs`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{announcement.body}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Icon name="user" className="w-3 h-3" />
                            {announcement.createdBy?.name || 'Teacher'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="calendar" className="w-3 h-3" />
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="announcement" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No announcements yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your teachers will post announcements here</p>
                </div>
              )}
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

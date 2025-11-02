'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { classAPI, announcementAPI } from '@/utils/api';
import { AttendanceTrendChart, DistributionChart } from '@/components/Charts';
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

export default function StaffDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [classesRes, announcementsRes] = await Promise.all([
        classAPI.getAll(),
        announcementAPI.getAll(),
      ]);

      setClasses(classesRes.data);
      setAnnouncements(announcementsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu}>
        <h1 className="mb-5">Teacher Dashboard</h1>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Students</p>
                    <h2 className="text-2xl font-bold text-blue-600">{totalStudents}</h2>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="users" className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">My Classes</p>
                    <h2 className="text-2xl font-bold text-green-600">{classes.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="class" className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <h2 className="text-lg font-bold text-purple-600">{user?.subject || 'N/A'}</h2>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="book" className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Announcements</p>
                    <h2 className="text-2xl font-bold text-orange-600">{announcements.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon name="announcement" className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-5">
              <div className="card">
                <h3 className="mb-3">Attendance Trend</h3>
                <AttendanceTrendChart />
              </div>

              <div className="card">
                <h3 className="mb-3">Grade Distribution</h3>
                <DistributionChart
                  data={{
                    labels: ['Passed (90+)', 'Satisfactory (75-89)', 'Needs Improvement'],
                    values: [45, 35, 10],
                  }}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* My Classes */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>My Classes</h3>
                  <a href="/staff/gradebook" className="text-xs text-blue-600 hover:text-blue-700">View Gradebook</a>
                </div>
                {classes.length > 0 ? (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-semibold">{cls.className}</h4>
                          <p className="text-xs text-gray-600">Room: {cls.room || 'N/A'}</p>
                        </div>
                        <span className="badge-info">{cls.students?.length || 0} students</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No classes assigned yet</p>
                )}
              </div>

              {/* Recent Announcements */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Recent Announcements</h3>
                  <a href="/staff/announcements" className="text-xs text-blue-600 hover:text-blue-700">View All</a>
                </div>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement._id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <h4 className="text-sm font-semibold">{announcement.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{announcement.body}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent announcements</p>
                )}
              </div>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { studentAPI, staffAPI, classAPI, eventAPI } from '@/utils/api';
import { ClassPerformanceChart, DistributionChart } from '@/components/Charts';
import Loading from '@/components/Loading';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Staff', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, staffRes, classesRes, eventsRes] = await Promise.all([
        studentAPI.getAll(),
        staffAPI.getAll(),
        classAPI.getAll(),
        eventAPI.getAll(),
      ]);

      setStudents(studentsRes.data);
      setStaff(staffRes.data);
      setClasses(classesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu}>
        <h1 className="mb-5">Admin Dashboard</h1>

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
                    <h2 className="text-2xl font-bold text-blue-600">{students.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="users" className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Staff</p>
                    <h2 className="text-2xl font-bold text-green-600">{staff.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="teacher" className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Classes</p>
                    <h2 className="text-2xl font-bold text-purple-600">{classes.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="class" className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Events</p>
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
                <h3 className="mb-3">Performance by Grade Level</h3>
                <ClassPerformanceChart />
              </div>

              <div className="card">
                <h3 className="mb-3">Student Distribution</h3>
                <DistributionChart
                  data={{
                    labels: ['Grade 7-8', 'Grade 9-10', 'Grade 11-12'],
                    values: [35, 40, 25],
                  }}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Recent Students */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Recent Students</h3>
                  <a href="/admin/students" className="text-xs text-blue-600 hover:text-blue-700">View All</a>
                </div>
                <div className="space-y-2">
                  {students.slice(0, 5).map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.gradeLevel} - {student.section}</p>
                      </div>
                      <span className="badge-info text-xs">{student.idNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Overview */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Staff Overview</h3>
                  <a href="/admin/staff" className="text-xs text-blue-600 hover:text-blue-700">View All</a>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Teachers</span>
                    <span className="text-xl font-bold text-blue-600">
                      {staff.filter((s) => s.role === 'teacher').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Administrators</span>
                    <span className="text-xl font-bold text-purple-600">
                      {staff.filter((s) => s.role === 'admin').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

'use client';

import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu}>
        <h1 className="mb-5">My Profile</h1>

        <div className="max-w-2xl">
          {/* Profile Header */}
          <div className="card mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Icon name="user" className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2>{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.idNumber}</p>
                <span className="badge-info mt-1">{user?.gradeLevel} - {user?.section}</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card mb-5">
            <h3 className="mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Student ID</p>
                <p className="text-sm font-medium">{user?.idNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Grade & Section</p>
                <p className="text-sm font-medium">{user?.gradeLevel} - {user?.section}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="text-sm">{user?.contact || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm">{user?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <h3 className="mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <span className="badge-info">Student</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Account Created</p>
                <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </ModernSidebar>
    </ProtectedRoute>
  );
}

'use client';

import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

const staffMenu = [
  { label: 'Dashboard', href: '/staff/dashboard', iconName: 'dashboard' },
  { label: 'Gradebook', href: '/staff/gradebook', iconName: 'grades' },
  { label: 'Attendance', href: '/staff/attendance', iconName: 'calendar' },
  { label: 'Materials', href: '/staff/materials', iconName: 'book' },
  { label: 'Announcements', href: '/staff/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StaffProfile() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu}>
        <h1 className="mb-5">My Profile</h1>

        <div className="max-w-2xl">
          {/* Profile Header */}
          <div className="card mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <Icon name="teacher" className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2>{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.idNumber}</p>
                <span className="badge-success mt-1">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card mb-5">
            <h3 className="mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                <p className="text-sm font-medium">{user?.idNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Subject</p>
                <p className="text-sm font-medium">{user?.subject || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="text-sm">{user?.contact || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <h3 className="mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <span className="badge-success capitalize">{user?.role}</span>
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

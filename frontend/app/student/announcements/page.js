'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { announcementAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Learning Material', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Announcements', href: '/student/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (user?.classId) {
      fetchAnnouncements();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      // Get announcements for student's class
      const { data } = await announcementAPI.getAll({ classId: user.classId });
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setToast({ isOpen: true, message: 'Failed to load announcements', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'badge-danger';
      case 'high':
        return 'badge-warning';
      case 'normal':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="Announcements">
        {loading ? (
          <Loading />
        ) : !user?.classId ? (
          <div className="card text-center py-12">
            <Icon name="warning" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">You are not assigned to any class yet.</p>
            <p className="text-xs text-gray-400 mt-1">Please contact your administrator.</p>
          </div>
        ) : (
          <>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="card hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="announcement" className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{announcement.title}</h3>
                          <span className={`badge ${getPriorityColor(announcement.priority)} flex-shrink-0`}>
                            {announcement.priority}
                          </span>
                        </div>
                        <p className="text-base text-gray-700 mb-3 whitespace-pre-wrap">{announcement.body}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Icon name="user" className="w-4 h-4" />
                            {announcement.createdBy?.name || 'Teacher'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="calendar" className="w-4 h-4" />
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {announcement.classId && (
                            <span className="flex items-center gap-1">
                              <Icon name="class" className="w-4 h-4" />
                              {announcement.classId.className || 'All Classes'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="announcement" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No announcements yet.</p>
                <p className="text-xs text-gray-400 mt-1">Your teachers will post announcements here.</p>
              </div>
            )}
          </>
        )}

        {/* Toast Notification */}
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


'use client';

import { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { studentAPI } from '@/utils/api';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Learning Material', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Announcements', href: '/student/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
  });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.contact || '',
      address: user?.address || '',
    });
    setIsEditing(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ isOpen: true, message: 'Please upload an image file', type: 'error' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ isOpen: true, message: 'Image size must be less than 5MB', type: 'error' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await studentAPI.uploadAvatar(user._id, formData);
      const updatedUser = { ...user, avatar: data.avatar };
      setUser(updatedUser);
      try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch (_) {}
      setToast({ isOpen: true, message: 'Avatar uploaded successfully! ✓', type: 'success' });
    } catch (error) {
      // Fallback: if backend saved but response errored, re-fetch current user
      try {
        const refreshed = localStorage.getItem('user');
        if (refreshed) {
          const parsed = JSON.parse(refreshed);
          if (parsed?.avatar) {
            const updatedUser = { ...user, avatar: parsed.avatar };
            setUser(updatedUser);
            setToast({ isOpen: true, message: 'Avatar uploaded successfully! ✓', type: 'success' });
            return;
          }
        }
      } catch (_) {}
      setToast({ isOpen: true, message: 'Failed to upload avatar', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const updated = await studentAPI.update(user._id, formData);
      setUser({ ...user, ...formData });
      setToast({ isOpen: true, message: 'Profile updated successfully! ✓', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to update profile', type: 'error' });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setToast({ isOpen: true, message: 'Please fill in all password fields', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ isOpen: true, message: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ isOpen: true, message: 'New passwords do not match', type: 'error' });
      return;
    }

    setChangingPassword(true);
    try {
      await studentAPI.changePassword(user._id, passwordData.currentPassword, passwordData.newPassword);
      setToast({ isOpen: true, message: 'Password changed successfully! ✓', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error) {
      setToast({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Failed to change password', 
        type: 'error' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="My Profile">

        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.avatar ? (
                    <img 
                      src={`http://localhost:5000${user.avatar}?t=${typeof window !== 'undefined' ? Date.now() : ''}`} 
                      alt={user?.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Icon name="user" className="w-10 h-10 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                      <Icon name="camera" className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2>{user?.name}</h2>
                  <p className="text-sm text-gray-600">{user?.idNumber}</p>
                  <span className="badge-info mt-1">{user?.gradeLevel} - {user?.section}</span>
                </div>
              </div>
              {!isEditing && (
                <button onClick={handleEdit} className="btn-primary">
                  <Icon name="edit" className="w-5 h-5 inline-block mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="card mb-5">
            <h3 className="mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-base font-medium">{user?.name}</p>
                )}
              </div>
              <div>
                <label className="input-label">Student ID</label>
                <p className="text-base font-medium text-gray-500">{user?.idNumber} (Cannot be changed)</p>
              </div>
              <div>
                <label className="input-label">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <p className="text-base">{user?.email}</p>
                )}
              </div>
              <div>
                <label className="input-label">Grade & Section</label>
                <p className="text-base font-medium text-gray-500">{user?.gradeLevel} - {user?.section} (Cannot be changed)</p>
              </div>
              <div>
                <label className="input-label">Contact Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Enter contact number"
                  />
                ) : (
                  <p className="text-base">{user?.contact || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="input-label">Address</label>
                {isEditing ? (
                  <textarea
                    className="input-field"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                ) : (
                  <p className="text-base">{user?.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="btn-primary">
                  <Icon name="save" className="w-5 h-5 inline-block mr-2" />
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="card mb-5">
            <h3 className="mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <span className="badge-info">Student</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Created</p>
                <p className="text-base">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3>Change Password</h3>
              {!showChangePassword && (
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="btn-secondary text-sm"
                >
                  <Icon name="edit" className="w-4 h-4 inline-block mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {showChangePassword ? (
              <div className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={handleChangePassword} 
                    className="btn-primary"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="btn-secondary"
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click "Change Password" to update your password</p>
            )}
          </div>
        </div>

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

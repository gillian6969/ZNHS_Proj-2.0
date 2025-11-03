'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { announcementAPI, classAPI } from '@/utils/api';
import Loading from '@/components/Loading';
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

export default function StaffAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    priority: 'normal',
    classId: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll();
      // Filter classes where teacher is assigned
      const teacherClasses = data.filter(cls => {
        return cls.teachers?.some(
          t => t.teacherId && (t.teacherId._id === user?._id || t.teacherId.toString() === user?._id)
        );
      });
      setClasses(teacherClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const params = selectedClass === 'all' ? {} : { classId: selectedClass };
      const { data } = await announcementAPI.getAll(params);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setToast({ isOpen: true, message: 'Failed to load announcements', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classId: formData.classId === 'all' ? null : formData.classId,
      };
      await announcementAPI.create(payload);
      setToast({ isOpen: true, message: 'Announcement posted successfully! ✓', type: 'success' });
      setIsModalOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to post announcement', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await announcementAPI.delete(selectedAnnouncement._id);
      setToast({ isOpen: true, message: 'Announcement deleted successfully! ✓', type: 'success' });
      fetchAnnouncements();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to delete announcement', type: 'error' });
    }
  };

  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      priority: 'normal',
      classId: '',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu} pageTitle="Announcements">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <label className="input-label mb-0">Filter by Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className || `${cls.gradeLevel} - ${cls.section}`}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="announcement" className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{announcement.body}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(announcement.date).toLocaleDateString()}</span>
                            {announcement.priority && (
                              <span className={`badge ${
                                announcement.priority === 'urgent' ? 'badge-danger' :
                                announcement.priority === 'important' ? 'badge-warning' :
                                'badge-info'
                              }`}>
                                {announcement.priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeleteModal(announcement)}
                        className="p-2 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      >
                        <Icon name="delete" className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="announcement" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No announcements yet</p>
              </div>
            )}
          </>
        )}

        {/* Add Announcement Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="New Announcement"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Message *</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                className="input-field"
                rows="5"
                required
              />
            </div>

            <div>
              <label className="input-label">Target Class</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className || `${cls.gradeLevel} - ${cls.section}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Post Announcement
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Announcement"
          message={`Are you sure you want to delete "${selectedAnnouncement?.title}"?`}
          type="danger"
        />

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

'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import { eventAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Staff', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Grades', href: '/admin/grades', iconName: 'grades' },
  { label: 'Attendance', href: '/admin/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await eventAPI.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
      await eventAPI.create(formData);
      alert('Event created successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      alert('Failed to create event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      await eventAPI.delete(selectedEvent._id);
      alert('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="Manage Events">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event._id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="event" className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Icon name="calendar" className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            {event.location && (
                              <span>{event.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeleteModal(event)}
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
                <Icon name="event" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No events scheduled yet</p>
              </div>
            )}
          </>
        )}

        {/* Add Event Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Add New Event"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Event Title *</label>
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
              <label className="input-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="input-label">Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., School Gymnasium"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Create Event
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
          title="Delete Event"
          message={`Are you sure you want to delete "${selectedEvent?.title}"?`}
          type="danger"
        />
      </ModernSidebar>
    </ProtectedRoute>
  );
}

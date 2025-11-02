'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import { staffAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Staff', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

const subjects = [
  'Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan',
  'TLE', 'MAPEH', 'ESP', 'Research', 'Reading and Writing'
];

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idNumber: '',
    password: '',
    role: 'teacher',
    subject: subjects[0],
    contact: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await staffAPI.getAll();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
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
      await staffAPI.create(formData);
      alert('Staff member created successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create staff member');
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    
    try {
      await staffAPI.delete(selectedStaff._id);
      alert('Staff member deleted successfully!');
      fetchStaff();
    } catch (error) {
      alert('Failed to delete staff member');
    }
  };

  const openDeleteModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      idNumber: '',
      password: '',
      role: 'teacher',
      subject: subjects[0],
      contact: '',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>Manage Staff</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Staff Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID Number</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Subject</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.length > 0 ? (
                    staff.map((member) => (
                      <tr key={member._id}>
                        <td className="font-medium">{member.idNumber}</td>
                        <td>{member.name}</td>
                        <td className="text-xs">{member.email}</td>
                        <td>
                          <span className={`badge ${member.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                            {member.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{member.subject || 'N/A'}</td>
                        <td className="text-xs">{member.contact || 'N/A'}</td>
                        <td>
                          <button
                            onClick={() => openDeleteModal(member)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Icon name="delete" className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No staff members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add Staff Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Add New Staff Member"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="input-label">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Contact Number</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="input-field"
                placeholder="09XXXXXXXXX"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Add Staff Member
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
          title="Delete Staff Member"
          message={`Are you sure you want to delete "${selectedStaff?.name}"? This action cannot be undone.`}
          type="danger"
        />
      </ModernSidebar>
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { staffAPI } from '@/utils/api';
import Loading from '@/components/Loading';
import { SUBJECTS } from '@/utils/constants';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Faculty', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Grades', href: '/admin/grades', iconName: 'grades' },
  { label: 'Attendance', href: '/admin/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

const subjects = [
  'Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan',
  'TLE', 'MAPEH', 'ESP', 'Research', 'Reading and Writing'
];

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    subject: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idNumber: '',
    password: '',
    role: 'teacher',
    subjects: [],
    contact: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, sortOrder, staff]);

  const fetchStaff = async () => {
    try {
      const { data } = await staffAPI.getAll();
      setStaff(data);
      setFilteredStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...staff];

    // Apply filters
    if (filters.role) {
      filtered = filtered.filter(s => s.role === filters.role);
    }

    if (filters.subject) {
      filtered = filtered.filter(s => s.subject === filters.subject);
    }

    if (filters.search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.idNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'idNumber':
          aValue = a.idNumber.toLowerCase();
          bValue = b.idNumber.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'subject':
          aValue = (a.subject || '').toLowerCase();
          bValue = (b.subject || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStaff(filtered);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSubjectToggle = (subject) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subjects.length === 0 && formData.role === 'teacher') {
      setToast({ isOpen: true, message: 'Please select at least one subject for teacher', type: 'error' });
      return;
    }
    try {
      await staffAPI.create(formData);
      setToast({ isOpen: true, message: 'Faculty member created successfully! ✓', type: 'success' });
      setIsModalOpen(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Failed to create faculty member', type: 'error' });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (formData.subjects.length === 0 && formData.role === 'teacher') {
      setToast({ isOpen: true, message: 'Please select at least one subject for teacher', type: 'error' });
      return;
    }
    
    try {
      const updateData = { ...formData };
      // Don't update password if not provided
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.idNumber; // Can't change ID number
      
      await staffAPI.update(selectedStaff._id, updateData);
      setToast({ isOpen: true, message: 'Faculty member updated successfully! ✓', type: 'success' });
      setIsEditModalOpen(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Failed to update faculty member', type: 'error' });
    }
  };

  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      idNumber: staffMember.idNumber,
      password: '', // Don't pre-fill password
      role: staffMember.role,
      subjects: staffMember.subjects || [],
      contact: staffMember.contact || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    
    try {
      await staffAPI.delete(selectedStaff._id);
      setToast({ isOpen: true, message: 'Faculty member deleted successfully! ✓', type: 'success' });
      fetchStaff();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to delete faculty member', type: 'error' });
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
      subjects: [],
      contact: '',
    });
    setSelectedStaff(null);
  };

  const clearFilters = () => {
    setFilters({ role: '', subject: '', search: '' });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="Manage Faculty">
        <div className="flex justify-end items-center mb-5">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Add Faculty
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Staff Table */}
            <div className="table-container">
              {/* Filter Toggle Button - Attached to table */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Showing {filteredStaff.length} of {staff.length} faculty members
                  </span>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={showFilters ? "Hide Filters" : "Show Filters"}
                >
                  <Icon name="more" className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Collapsible Filters */}
              {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="input-label">Role</label>
                      <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        className="input-field"
                      >
                        <option value="">All Roles</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Subject</label>
                      <select
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        className="input-field"
                      >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Search</label>
                      <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="input-field"
                        placeholder="Name, ID, or email..."
                      />
                    </div>
                    <div className="flex items-end">
                      <button onClick={clearFilters} className="btn-outline w-full">
                        Clear Filters
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="input-label text-sm">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="idNumber">ID Number</option>
                      <option value="role">Role</option>
                      <option value="subject">Subject</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="btn-outline flex items-center gap-1 text-sm px-3 py-1.5"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      <Icon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} className="w-4 h-4" />
                      {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                    <button onClick={clearFilters} className="btn-outline text-sm px-3 py-1.5 ml-auto">
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              <table>
                <thead>
                  <tr>
                    <th className="align-middle">ID Number</th>
                    <th className="align-middle">Name</th>
                    <th className="align-middle">Email</th>
                    <th className="align-middle">Role</th>
                    <th className="align-middle">Subject</th>
                    <th className="align-middle">Contact</th>
                    <th className="align-middle">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((member) => (
                      <tr key={member._id}>
                        <td className="font-medium align-middle">{member.idNumber}</td>
                        <td className="align-middle">{member.name}</td>
                        <td className="text-xs align-middle">{member.email}</td>
                        <td className="align-middle">
                          <span className={`badge ${member.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                            {member.role.toUpperCase()}
                          </span>
                        </td>
                                <td className="align-middle">
                                  <div className="flex flex-wrap gap-1">
                                    {(member.subjects || []).map((subj, idx) => (
                                      <span key={idx} className="badge badge-info text-xs">
                                        {subj}
                                      </span>
                                    ))}
                                    {(!member.subjects || member.subjects.length === 0) && 'N/A'}
                                  </div>
                                </td>
                        <td className="text-xs align-middle">{member.contact || 'N/A'}</td>
                        <td className="align-middle">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Icon name="edit" className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(member)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Icon name="delete" className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No faculty members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add Faculty Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Add New Faculty Member"
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
              <label className="input-label">Subjects * (Select one or more)</label>
              <div className="border-2 border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-base font-medium">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.subjects.length} subject(s)
              </p>
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
                Add Faculty Member
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

        {/* Edit Faculty Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
          }}
          title="Edit Faculty Member"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
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

            <div>
              <label className="input-label">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                className="input-field"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">ID Number cannot be changed</p>
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

            <div>
              <label className="input-label">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Leave blank to keep current password"
              />
            </div>

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
              <label className="input-label">Subjects * (Select one or more)</label>
              <div className="border-2 border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-base font-medium">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.subjects.length} subject(s)
              </p>
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
                Update Faculty Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
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
          title="Delete Faculty Member"
          message={`Are you sure you want to delete "${selectedStaff?.name}"? This action cannot be undone.`}
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

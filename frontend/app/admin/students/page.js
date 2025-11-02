'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import { studentAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Staff', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    search: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idNumber: '',
    password: '',
    gradeLevel: 'Grade 7',
    section: '',
    contact: '',
    address: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    if (filters.grade) {
      filtered = filtered.filter(s => s.gradeLevel === filters.grade);
    }

    if (filters.section) {
      filtered = filtered.filter(s => s.section?.toLowerCase().includes(filters.section.toLowerCase()));
    }

    if (filters.search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.idNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      alert('Student created successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create student');
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    try {
      await studentAPI.delete(selectedStudent._id);
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      alert('Failed to delete student');
    }
  };

  const viewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      idNumber: '',
      password: '',
      gradeLevel: 'Grade 7',
      section: '',
      contact: '',
      address: '',
    });
  };

  const clearFilters = () => {
    setFilters({ grade: '', section: '', search: '' });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu}>
        {/* Page Header */}
        <div className="flex justify-between items-center mb-5">
          <h1>Manage Students</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Filters */}
            <div className="card mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="filter" className="w-5 h-5 text-gray-600" />
                <h3>Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="input-label">Grade Level</label>
                  <select
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Grades</option>
                    {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    className="input-field"
                    placeholder="Enter section..."
                  />
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
              <p className="text-xs text-gray-500 mt-2">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>

            {/* Students Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID Number</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Section</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="font-medium">{student.idNumber}</td>
                        <td>{student.name}</td>
                        <td><span className="badge-info">{student.gradeLevel}</span></td>
                        <td>{student.section || 'N/A'}</td>
                        <td className="text-xs">{student.email}</td>
                        <td className="text-xs">{student.contact || 'N/A'}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewStudent(student)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Icon name="view" className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(student)}
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
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add Student Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Add New Student"
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
                <label className="input-label">Grade Level *</label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Section *</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Einstein"
                  required
                />
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

            <div>
              <label className="input-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="Complete address"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Add Student
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

        {/* View Student Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Student Information"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Icon name="user" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.idNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grade Level</p>
                  <span className="badge-info">{selectedStudent.gradeLevel}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Section</p>
                  <p className="text-sm font-medium">{selectedStudent.section || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm">{selectedStudent.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                <p className="text-sm">{selectedStudent.contact || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm">{selectedStudent.address || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Registered On</p>
                <p className="text-sm">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn-outline w-full mt-4"
              >
                Close
              </button>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Student"
          message={`Are you sure you want to delete "${selectedStudent?.name}"? This action cannot be undone.`}
          type="danger"
        />
      </ModernSidebar>
    </ProtectedRoute>
  );
}

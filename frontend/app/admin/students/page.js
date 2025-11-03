'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { studentAPI, gradeAPI, attendanceAPI } from '@/utils/api';
import Loading from '@/components/Loading';
import { GRADE_LEVELS, SECTIONS } from '@/utils/constants';

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

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
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
  }, [filters, sortBy, sortOrder, students]);

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
      filtered = filtered.filter(s => s.section === filters.section);
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
        case 'grade':
          aValue = (a.gradeLevel || '').toLowerCase();
          bValue = (b.gradeLevel || '').toLowerCase();
          break;
        case 'section':
          aValue = (a.section || '').toLowerCase();
          bValue = (b.section || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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
      setToast({ isOpen: true, message: 'Student created successfully! ✓', type: 'success' });
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Failed to create student', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    try {
      await studentAPI.delete(selectedStudent._id);
      setToast({ isOpen: true, message: 'Student deleted successfully! ✓', type: 'success' });
      fetchStudents();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to delete student', type: 'error' });
    }
  };

  const viewStudent = async (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
    setLoadingStudentData(true);
    
    try {
      // Fetch grades and attendance for the student
      const [gradesRes, attendanceRes] = await Promise.all([
        gradeAPI.getAll({ studentId: student._id }),
        attendanceAPI.getAll({ studentId: student._id }),
      ]);
      
      setStudentGrades(gradesRes.data || []);
      setStudentAttendance(attendanceRes.data || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoadingStudentData(false);
    }
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
      gradeLevel: GRADE_LEVELS[0],
      section: '',
      contact: '',
      address: '',
    });
  };

  const clearFilters = () => {
    setFilters({ grade: '', section: '', search: '' });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="Manage Students">
        <div className="flex justify-end items-center mb-5">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Students Table */}
            <div className="table-container">
              {/* Filter Toggle Button - Attached to table */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Students</h3>
                  <span className="text-xs text-gray-500">
                    ({filteredStudents.length} of {students.length})
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
                  <select
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Sections</option>
                    {SECTIONS.map(section => (
                      <option key={section} value={section}>{section}</option>
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
                      <option value="grade">Grade</option>
                      <option value="section">Section</option>
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
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map(section => (
                    <option key={section} value={section}>{section}</option>
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
          onClose={() => {
            setIsViewModalOpen(false);
            setStudentGrades([]);
            setStudentAttendance([]);
          }}
          title="Student Information"
          size="xl"
        >
          {selectedStudent && (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Basic Info */}
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

              {/* Grades Section */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="grades" className="w-5 h-5" />
                  Grades
                </h4>
                {loadingStudentData ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading grades...</p>
                  </div>
                ) : studentGrades.length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th className="text-center">Q1</th>
                          <th className="text-center">Q2</th>
                          <th className="text-center">Q3</th>
                          <th className="text-center">Q4</th>
                          <th className="text-center">Final</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.map((grade) => (
                          <tr key={grade._id}>
                            <td className="font-medium">{grade.subject}</td>
                            <td className="text-center">{grade.q1 || '-'}</td>
                            <td className="text-center">{grade.q2 || '-'}</td>
                            <td className="text-center">{grade.q3 || '-'}</td>
                            <td className="text-center">{grade.q4 || '-'}</td>
                            <td className="text-center font-bold">{grade.final || '-'}</td>
                            <td className="text-center">
                              {grade.final >= 75 ? (
                                <span className="badge-success">Passed</span>
                              ) : grade.final ? (
                                <span className="badge-danger">Failed</span>
                              ) : (
                                <span className="badge-warning">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No grades available</p>
                )}
              </div>

              {/* Attendance Section */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="calendar" className="w-5 h-5" />
                  Attendance
                </h4>
                {loadingStudentData ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading attendance...</p>
                  </div>
                ) : studentAttendance.length > 0 ? (
                  <>
                    {/* Attendance Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Present</p>
                        <p className="text-lg font-bold text-green-700">
                          {studentAttendance.filter(a => a.status === 'present').length}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">Late</p>
                        <p className="text-lg font-bold text-yellow-700">
                          {studentAttendance.filter(a => a.status === 'late').length}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-gray-600 mb-1">Absent</p>
                        <p className="text-lg font-bold text-red-700">
                          {studentAttendance.filter(a => a.status === 'absent').length}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Excused</p>
                        <p className="text-lg font-bold text-blue-700">
                          {studentAttendance.filter(a => a.status === 'excused').length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentAttendance.slice(0, 10).map((record) => (
                            <tr key={record._id}>
                              <td>
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td>
                                {record.status === 'present' && (
                                  <span className="badge-success">Present</span>
                                )}
                                {record.status === 'late' && (
                                  <span className="badge-warning">Late</span>
                                )}
                                {record.status === 'absent' && (
                                  <span className="badge-danger">Absent</span>
                                )}
                                {record.status === 'excused' && (
                                  <span className="badge-info">Excused</span>
                                )}
                              </td>
                              <td className="text-sm text-gray-600">{record.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {studentAttendance.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Showing latest 10 of {studentAttendance.length} records
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No attendance records available</p>
                )}
              </div>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setStudentGrades([]);
                  setStudentAttendance([]);
                }}
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

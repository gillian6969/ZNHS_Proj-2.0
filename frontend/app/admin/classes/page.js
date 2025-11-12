'use client';

import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { classAPI, staffAPI } from '@/utils/api';
import { SECTIONS } from '@/utils/constants';
import { useEffect, useState } from 'react';

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

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    gradeLevel: 'Grade 7',
    section: '',
    room: '',
    teachers: [],
    adviser: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, sortOrder, classes]);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        classAPI.getAll(),
        staffAPI.getAll(),
      ]);

      setClasses(classesRes.data);
      setFilteredClasses(classesRes.data);
      setTeachers(teachersRes.data.filter(s => s.role === 'teacher'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...classes];

    // Apply filters
    if (filters.grade) {
      filtered = filtered.filter(c => c.gradeLevel === filters.grade);
    }

    if (filters.search) {
      filtered = filtered.filter(c =>
        c.className?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.section?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.room?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.className || '').toLowerCase();
          bValue = (b.className || '').toLowerCase();
          break;
        case 'grade':
          aValue = (a.gradeLevel || '').toLowerCase();
          bValue = (b.gradeLevel || '').toLowerCase();
          break;
        case 'students':
          aValue = a.students?.length || 0;
          bValue = b.students?.length || 0;
          break;
        case 'teachers':
          aValue = a.teachers?.length || 0;
          bValue = b.teachers?.length || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredClasses(filtered);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTeacherSubjectSelect = (teacherId, subject) => {
    if (!subject) {
      // If no subject selected, remove the teacher
      handleRemoveTeacher(teacherId);
      return;
    }

    // Normalize teacherId to string for comparison
    const normalizedTeacherId = typeof teacherId === 'object' ? teacherId._id || teacherId.toString() : teacherId;
    
    // Check if teacher already assigned (compare as strings)
    const existingIndex = formData.teachers.findIndex(t => {
      const tId = typeof t.teacherId === 'object' ? t.teacherId._id || t.teacherId.toString() : t.teacherId;
      return String(tId) === String(normalizedTeacherId);
    });
    
    if (existingIndex >= 0) {
      // Update subject for existing teacher
      const updated = [...formData.teachers];
      updated[existingIndex] = { teacherId: normalizedTeacherId, subject };
      setFormData({ ...formData, teachers: updated });
    } else {
      // Add new teacher with subject
      setFormData({
        ...formData,
        teachers: [...formData.teachers, { teacherId: normalizedTeacherId, subject }],
      });
    }
  };

  const handleRemoveTeacher = (teacherId) => {
    // Normalize teacherId to string for comparison
    const normalizedTeacherId = typeof teacherId === 'object' ? teacherId._id || teacherId.toString() : teacherId;
    
    setFormData({
      ...formData,
      teachers: formData.teachers.filter(t => {
        const tId = typeof t.teacherId === 'object' ? t.teacherId._id || t.teacherId.toString() : t.teacherId;
        return String(tId) !== String(normalizedTeacherId);
      }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.teachers.length === 0) {
      setToast({ isOpen: true, message: 'Please assign at least one teacher to this class', type: 'error' });
      return;
    }

    try {
      const payload = {
        gradeLevel: formData.gradeLevel,
        section: formData.section,
        room: formData.room,
        teachers: formData.teachers,
        adviser: formData.adviser || null,
      };

      if (selectedClass && isEditModalOpen) {
        // Update existing class
        await classAPI.update(selectedClass._id, payload);
        setToast({ isOpen: true, message: 'Class updated successfully! ✓', type: 'success' });
        setIsEditModalOpen(false);
      } else {
        // Create new class
        await classAPI.create({
          ...payload,
          schoolYear: '2024-2025',
        });
        setToast({ isOpen: true, message: 'Class created successfully! ✓', type: 'success' });
        setIsModalOpen(false);
      }
      resetForm();
      fetchData();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || `Failed to ${selectedClass ? 'update' : 'create'} class`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    
    try {
      await classAPI.delete(selectedClass._id);
      setToast({ isOpen: true, message: 'Class deleted successfully! ✓', type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to delete class', type: 'error' });
    }
  };

  const viewClassDetails = (cls) => {
    setSelectedClass(cls);
    setIsViewModalOpen(true);
  };

  const openEditModal = (cls) => {
    setSelectedClass(cls);
    // Normalize teachers array - ensure teacherId is always a string, not an object
    const normalizedTeachers = (cls.teachers || []).map(t => ({
      teacherId: typeof t.teacherId === 'object' ? t.teacherId._id || t.teacherId.toString() : t.teacherId,
      subject: t.subject || '',
    }));
    
    const adviserValue = cls.adviser ? (typeof cls.adviser === 'object' ? cls.adviser._id : cls.adviser) : '';
    
    setFormData({
      gradeLevel: cls.gradeLevel || 'Grade 7',
      section: cls.section || '',
      room: cls.room || '',
      teachers: normalizedTeachers,
      adviser: adviserValue,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cls) => {
    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      gradeLevel: 'Grade 7',
      section: '',
      room: '',
      teachers: [],
      adviser: '',
    });
    setSelectedClass(null);
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

  const clearFilters = () => {
    setFilters({ grade: '', search: '' });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="Manage Classes">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Create Class
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Classes Header with Filter Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Classes</h3>
                <span className="text-xs text-gray-500">
                  ({filteredClasses.length} of {classes.length})
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
              <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                    <label className="input-label">Search</label>
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="input-field"
                      placeholder="Class name, section, or room..."
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
                    <option value="name">Class Name</option>
                    <option value="grade">Grade Level</option>
                    <option value="students">Number of Students</option>
                    <option value="teachers">Number of Teachers</option>
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

            {/* Classes Grid */}
            {filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <div key={cls._id} className="card hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Icon name="class" className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 text-gray-900">{cls.className}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Icon name="calendar" className="w-4 h-4" />
                            <span>{cls.schoolYear || '2024-2025'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => viewClassDetails(cls)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Icon name="view" className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(cls)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors shadow-sm"
                          title="Edit Class"
                        >
                          <Icon name="edit" className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cls)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                          title="Delete"
                        >
                          <Icon name="delete" className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Icon name="location" className="w-4 h-4" />
                        <span className="font-medium">Room: {cls.room || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="users" className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600 font-medium">Students</span>
                        </div>
                        <p className="text-xl font-bold text-blue-700">{cls.students?.length || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="teacher" className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-gray-600 font-medium">Teachers</span>
                        </div>
                        <p className="text-xl font-bold text-purple-700">{cls.teachers?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="class" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No classes found</p>
              </div>
            )}
          </>
        )}

        {/* Create Class Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Create New Class"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="input-label">Room</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Room 101"
              />
            </div>

            <div>
              <label className="input-label">Class Adviser</label>
              <select
                name="adviser"
                value={formData.adviser}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">-- No Adviser --</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">The adviser must also be assigned as a subject teacher above</p>
            </div>

            <div>
              <label className="input-label">Assign Teachers & Subjects *</label>
              <div className="border-2 border-gray-300 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 bg-gray-50">
                {teachers.length > 0 ? (
                  teachers.map((teacher) => {
                    // Normalize comparison - ensure we compare string IDs
                    const assigned = formData.teachers.find(t => {
                      const tId = typeof t.teacherId === 'object' ? t.teacherId._id || t.teacherId.toString() : t.teacherId;
                      return String(tId) === String(teacher._id);
                    });
                    return (
                      <div key={teacher._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-500">ID: {teacher.idNumber}</p>
                          </div>
                          {assigned && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTeacher(teacher._id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Remove teacher"
                            >
                              <Icon name="close" className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select subject for this class:
                          </label>
                          <select
                            value={assigned?.subject || ''}
                            onChange={(e) => handleTeacherSubjectSelect(teacher._id, e.target.value)}
                            className="input-field"
                          >
                            <option value="">-- Select Subject --</option>
                            {(teacher.subjects || []).map(subj => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-base text-gray-500 text-center py-8">No teachers available</p>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Assigned: {formData.teachers.length} teacher(s)
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Class Name Preview:</strong> {formData.gradeLevel} - {formData.section || '[Section]'}
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                {selectedClass && isEditModalOpen ? 'Update Class' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
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

        {/* Edit Class Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetForm();
          }}
          title="Edit Class"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="input-label">Room</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Room 101"
              />
            </div>

            <div>
              <label className="input-label">Class Adviser</label>
              <select
                name="adviser"
                value={formData.adviser}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">-- No Adviser --</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">The adviser must also be assigned as a subject teacher above</p>
            </div>

            <div>
              <label className="input-label">Assign Teachers & Subjects *</label>
              <div className="border-2 border-gray-300 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 bg-gray-50">
                {teachers.length > 0 ? (
                  teachers.map((teacher) => {
                    // Normalize comparison - ensure we compare string IDs
                    const assigned = formData.teachers.find(t => {
                      const tId = typeof t.teacherId === 'object' ? t.teacherId._id || t.teacherId.toString() : t.teacherId;
                      return String(tId) === String(teacher._id);
                    });
                    return (
                      <div key={teacher._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-500">ID: {teacher.idNumber}</p>
                          </div>
                          {assigned && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTeacher(teacher._id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Remove teacher"
                            >
                              <Icon name="close" className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select subject for this class:
                          </label>
                          <select
                            value={assigned?.subject || ''}
                            onChange={(e) => handleTeacherSubjectSelect(teacher._id, e.target.value)}
                            className="input-field"
                          >
                            <option value="">-- Select Subject --</option>
                            {(teacher.subjects || []).map(subj => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-base text-gray-500 text-center py-8">No teachers available</p>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Assigned: {formData.teachers.length} teacher(s)
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Class Name Preview:</strong> {formData.gradeLevel} - {formData.section || '[Section]'}
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Update Class
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

        {/* View Class Details Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Class Details"
        >
          {selectedClass && (
            <div className="space-y-4">
              <div className="pb-4 border-b">
                <h3 className="text-lg font-bold">{selectedClass.className}</h3>
                <p className="text-sm text-gray-600">Room: {selectedClass.room || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Assigned Teachers</h4>
                {selectedClass.teachers && selectedClass.teachers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClass.teachers.map((teacher, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Icon name="teacher" className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{teacher.teacherId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-600">{teacher.subject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No teachers assigned</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Students</h4>
                <p className="text-sm text-gray-600">{selectedClass.students?.length || 0} students enrolled</p>
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
          title="Delete Class"
          message={`Are you sure you want to delete "${selectedClass?.className}"? This action cannot be undone.`}
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

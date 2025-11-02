'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import { classAPI, staffAPI, studentAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const adminMenu = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'dashboard' },
  { label: 'Students', href: '/admin/students', iconName: 'users' },
  { label: 'Staff', href: '/admin/staff', iconName: 'teacher' },
  { label: 'Classes', href: '/admin/classes', iconName: 'class' },
  { label: 'Events', href: '/admin/events', iconName: 'event' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    gradeLevel: 'Grade 7',
    section: '',
    room: '',
    teachers: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        classAPI.getAll(),
        staffAPI.getAll(),
      ]);

      setClasses(classesRes.data);
      setTeachers(teachersRes.data.filter(s => s.role === 'teacher'));
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleTeacherToggle = (teacherId, teacherSubject) => {
    const exists = formData.teachers.find(t => t.teacherId === teacherId);
    
    if (exists) {
      // Remove teacher
      setFormData({
        ...formData,
        teachers: formData.teachers.filter(t => t.teacherId !== teacherId),
      });
    } else {
      // Add teacher with their subject
      setFormData({
        ...formData,
        teachers: [...formData.teachers, { teacherId, subject: teacherSubject }],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.teachers.length === 0) {
      alert('Please assign at least one teacher to this class');
      return;
    }

    try {
      await classAPI.create({
        gradeLevel: formData.gradeLevel,
        section: formData.section,
        room: formData.room,
        teachers: formData.teachers,
        schoolYear: '2024-2025',
      });
      
      alert('Class created successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    
    try {
      await classAPI.delete(selectedClass._id);
      alert('Class deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to delete class');
    }
  };

  const viewClassDetails = (cls) => {
    setSelectedClass(cls);
    setIsViewModalOpen(true);
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
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>Class Management</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Icon name="add" className="w-4 h-4" />
            Create Class
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Classes Grid */}
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls._id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon name="class" className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => viewClassDetails(cls)}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Icon name="view" className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cls)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Icon name="delete" className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold mb-1">{cls.className}</h3>
                    <p className="text-xs text-gray-600 mb-3">Room: {cls.room || 'N/A'}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">{cls.students?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Teachers:</span>
                        <span className="font-medium">{cls.teachers?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="class" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No classes created yet</p>
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
              <label className="input-label">Assign Teachers *</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <label key={teacher._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.teachers.some(t => t.teacherId === teacher._id)}
                        onChange={() => handleTeacherToggle(teacher._id, teacher.subject)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{teacher.name}</p>
                        <p className="text-xs text-gray-600">{teacher.subject}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No teachers available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.teachers.length} teacher(s)
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Class Name Preview:</strong> {formData.gradeLevel} - {formData.section || '[Section]'}
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Create Class
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
      </ModernSidebar>
    </ProtectedRoute>
  );
}

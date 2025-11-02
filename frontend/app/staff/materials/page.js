'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { classAPI, materialAPI, submissionAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const staffMenu = [
  { label: 'Dashboard', href: '/staff/dashboard', iconName: 'dashboard' },
  { label: 'Gradebook', href: '/staff/gradebook', iconName: 'grades' },
  { label: 'Attendance', href: '/staff/attendance', iconName: 'calendar' },
  { label: 'Materials', href: '/staff/materials', iconName: 'book' },
  { label: 'Announcements', href: '/staff/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StaffMaterials() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materialType: 'document',
    dueDate: '',
  });

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchMaterials();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const { data } = await materialAPI.getAll({ classId: selectedClass });
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or MP4 files only.');
        return;
      }
      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      const data = new FormData();
      data.append('material', file);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('materialType', formData.materialType);
      data.append('subject', user.subject);
      data.append('classId', selectedClass);
      data.append('uploadedBy', user._id);
      if (formData.dueDate) {
        data.append('dueDate', formData.dueDate);
      }

      await materialAPI.create(data);
      alert('Material uploaded successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    
    try {
      await materialAPI.delete(selectedMaterial._id);
      alert('Material deleted successfully!');
      fetchMaterials();
    } catch (error) {
      alert('Failed to delete material');
    }
  };

  const viewSubmissions = async (material) => {
    setSelectedMaterial(material);
    try {
      const { data } = await materialAPI.getSubmissions(material._id);
      setSubmissions(data);
      setIsSubmissionsModalOpen(true);
    } catch (error) {
      alert('Failed to load submissions');
    }
  };

  const gradeSubmission = async (submissionId) => {
    const score = prompt('Enter score (0-100):');
    const feedback = prompt('Enter feedback (optional):');
    
    if (score === null) return;
    
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert('Invalid score. Please enter a number between 0 and 100.');
      return;
    }

    try {
      await submissionAPI.grade(submissionId, { score: scoreNum, feedback });
      alert('Submission graded successfully!');
      viewSubmissions(selectedMaterial);
    } catch (error) {
      alert('Failed to grade submission');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      materialType: 'document',
      dueDate: '',
    });
    setFile(null);
  };

  const openDeleteModal = (material) => {
    setSelectedMaterial(material);
    setIsDeleteModalOpen(true);
  };

  const currentClass = classes.find(c => c._id === selectedClass);

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>Learning Materials</h1>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary flex items-center gap-2"
            disabled={!selectedClass}
          >
            <Icon name="upload" className="w-4 h-4" />
            Upload Material
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Class Selector */}
            {classes.length > 0 && (
              <div className="card mb-5">
                <label className="input-label">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input-field max-w-md"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} ({cls.students?.length || 0} students)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Materials List */}
            {selectedClass ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material._id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="file" className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{material.title}</h3>
                            <span className="badge-info flex-shrink-0">{material.subject}</span>
                            {material.materialType === 'assignment' && (
                              <span className="badge-warning flex-shrink-0">Assignment</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                            {material.dueDate && (
                              <span className="text-red-600 font-medium">
                                Due: {new Date(material.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {material.materialType === 'assignment' && (
                          <button
                            onClick={() => viewSubmissions(material)}
                            className="btn-success text-xs flex items-center gap-1"
                          >
                            <Icon name="view" className="w-4 h-4" />
                            Submissions
                          </button>
                        )}
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${material.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          Download
                        </a>
                        <button
                          onClick={() => openDeleteModal(material)}
                          className="btn-danger text-xs flex items-center gap-1"
                        >
                          <Icon name="delete" className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {materials.length === 0 && (
                  <div className="card text-center py-12">
                    <Icon name="book" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No materials uploaded yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="warning" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No classes assigned yet.</p>
              </div>
            )}
          </>
        )}

        {/* Upload Material Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Upload Learning Material"
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
                placeholder="e.g., Module 1: Introduction"
                required
              />
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Brief description of the material"
              />
            </div>

            <div>
              <label className="input-label">Type *</label>
              <select
                name="materialType"
                value={formData.materialType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="document">Document/Lesson</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="input-label">Upload File * (PDF, DOC, DOCX, PPT, PPTX, MP4 - Max 50MB)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="input-field"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                required
              />
              {file && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="check" className="w-3 h-3" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {formData.materialType === 'assignment' && (
              <div>
                <label className="input-label">Due Date</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="btn-outline flex-1"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* View Submissions Modal */}
        <Modal
          isOpen={isSubmissionsModalOpen}
          onClose={() => setIsSubmissionsModalOpen(false)}
          title={`Submissions: ${selectedMaterial?.title}`}
        >
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{submission.studentId.name}</h4>
                      <p className="text-xs text-gray-600">{submission.studentId.idNumber}</p>
                    </div>
                    <span className={`badge ${
                      submission.status === 'graded' ? 'badge-success' :
                      submission.status === 'late' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {submission.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                  </p>

                  {submission.comments && (
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Comments:</strong> {submission.comments}
                    </p>
                  )}

                  {submission.score !== undefined && (
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Score:</strong> {submission.score}/100
                    </p>
                  )}

                  {submission.feedback && (
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Feedback:</strong> {submission.feedback}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${submission.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Icon name="view" className="w-3 h-3" />
                      View File
                    </a>
                    <button
                      onClick={() => gradeSubmission(submission._id)}
                      className="btn-primary text-xs flex items-center gap-1"
                    >
                      <Icon name="edit" className="w-3 h-3" />
                      {submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No submissions yet.</p>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Material"
          message={`Are you sure you want to delete "${selectedMaterial?.title}"? This action cannot be undone.`}
          type="danger"
        />
      </ModernSidebar>
    </ProtectedRoute>
  );
}

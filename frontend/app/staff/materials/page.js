'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
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
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [gradingModal, setGradingModal] = useState({ isOpen: false, submission: null, score: '', feedback: '' });
  const [viewSubmissionModal, setViewSubmissionModal] = useState({ isOpen: false, submission: null });
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
      
      // Fetch submission counts for all materials
      const counts = {};
      for (const material of data) {
        try {
          const { data: submissionsData } = await materialAPI.getSubmissions(material._id);
          counts[material._id] = submissionsData.length || 0;
        } catch (error) {
          counts[material._id] = 0;
        }
      }
      setSubmissionCounts(counts);
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
        setToast({ isOpen: true, message: 'Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or MP4 files only.', type: 'error' });
        return;
      }
      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setToast({ isOpen: true, message: 'File size must be less than 50MB', type: 'error' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setToast({ isOpen: true, message: 'Please select a file to upload', type: 'error' });
      return;
    }

    setUploading(true);
    
    try {
      // Get subject from the selected class where teacher is assigned
      const currentClass = classes.find(c => c._id === selectedClass);
      if (!currentClass || !currentClass.teachers) {
        setToast({ isOpen: true, message: 'No class selected or class has no assigned teachers', type: 'error' });
        setUploading(false);
        return;
      }

      // Find teacher's subject in this class
      const teacherAssignment = currentClass.teachers.find(
        t => t.teacherId && (t.teacherId._id === user._id || t.teacherId.toString() === user._id)
      );

      if (!teacherAssignment || !teacherAssignment.subject) {
        setToast({ isOpen: true, message: 'You are not assigned to teach any subject in this class', type: 'error' });
        setUploading(false);
        return;
      }

      const data = new FormData();
      data.append('material', file);
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      data.append('materialType', formData.materialType);
      data.append('subject', teacherAssignment.subject);
      data.append('classId', selectedClass);
      if (formData.dueDate) {
        data.append('dueDate', formData.dueDate);
      }

      await materialAPI.create(data);
      setToast({ isOpen: true, message: 'Material uploaded successfully! ✓', type: 'success' });
      setIsModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Failed to upload material', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    
    try {
      await materialAPI.delete(selectedMaterial._id);
      setToast({ isOpen: true, message: 'Material deleted successfully! ✓', type: 'success' });
      fetchMaterials();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to delete material', type: 'error' });
    }
  };

  const viewSubmissions = async (material) => {
    setSelectedMaterial(material);
    setIsSubmissionsModalOpen(true);
    try {
      const { data } = await materialAPI.getSubmissions(material._id);
      setSubmissions(data);
      // Update submission count
      setSubmissionCounts(prev => ({
        ...prev,
        [material._id]: data.length || 0
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setToast({ isOpen: true, message: 'Failed to load submissions', type: 'error' });
      setSubmissions([]);
    }
  };

  const openGradingModal = (submission) => {
    setGradingModal({
      isOpen: true,
      submission,
      score: submission.score !== undefined ? submission.score.toString() : '',
      feedback: submission.feedback || '',
    });
  };

  const closeGradingModal = () => {
    setGradingModal({ isOpen: false, submission: null, score: '', feedback: '' });
  };

  const gradeSubmission = async () => {
    if (!gradingModal.submission) return;
    
    const scoreNum = parseFloat(gradingModal.score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setToast({ isOpen: true, message: 'Invalid score. Please enter a number between 0 and 100.', type: 'error' });
      return;
    }

    try {
      await submissionAPI.grade(gradingModal.submission._id, { 
        score: scoreNum, 
        feedback: gradingModal.feedback || '' 
      });
      setToast({ isOpen: true, message: 'Submission graded successfully! ✓', type: 'success' });
      closeGradingModal();
      // Refresh submissions to show updated grade
      await viewSubmissions(selectedMaterial);
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to grade submission', type: 'error' });
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
      <ModernSidebar menuItems={staffMenu} pageTitle="Learning Materials">
        <div className="flex justify-between items-center mb-5">
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
                        <button
                          onClick={() => viewSubmissions(material)}
                          className={`text-xs flex items-center gap-1 ${
                            material.materialType === 'assignment' 
                              ? 'btn-primary' 
                              : 'btn-secondary'
                          }`}
                          title="View student submissions"
                        >
                          <Icon name="view" className="w-4 h-4" />
                          Submissions
                          {submissionCounts[material._id] !== undefined && (
                            <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                              {submissionCounts[material._id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (!material.fileUrl) {
                              setToast({ isOpen: true, message: 'File URL not available', type: 'error' });
                              return;
                            }
                            // Clean URL - remove /api if it exists, ensure it starts with /
                            let cleanUrl = material.fileUrl;
                            if (cleanUrl.startsWith('/api')) {
                              cleanUrl = cleanUrl.replace('/api', '');
                            }
                            if (!cleanUrl.startsWith('/')) {
                              cleanUrl = '/' + cleanUrl;
                            }
                            
                            // Use base URL without /api since uploads are served directly at /uploads
                            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
                            const fileUrl = `${baseUrl}${cleanUrl}`;
                            
                            // Create download link
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.download = material.fileName || material.title;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          Download
                        </button>
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
          title={
            <div className="flex items-center gap-2">
              <span>Submissions: {selectedMaterial?.title}</span>
              {submissions.length > 0 && (
                <span className="text-sm font-normal text-gray-500 bg-blue-50 px-2 py-1 rounded-lg">
                  {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
                </span>
              )}
            </div>
          }
          size="xl"
        >
          <div className="overflow-x-auto">
            {submissions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comment</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">View</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{submission.studentId.name}</p>
                          <p className="text-xs text-gray-500">{submission.studentId.idNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                        {submission.comments ? (
                          <p className="truncate" title={submission.comments}>{submission.comments}</p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setViewSubmissionModal({ isOpen: true, submission })}
                          className="btn-secondary text-xs flex items-center gap-1 mx-auto"
                        >
                          <Icon name="view" className="w-4 h-4" />
                          View
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {submission.score !== undefined ? (
                          <div>
                            <span className="font-semibold text-blue-600">{submission.score}/100</span>
                            {submission.status === 'graded' && (
                              <span className="ml-2 badge-success text-xs">Graded</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openGradingModal(submission)}
                          className={`text-xs flex items-center gap-1 mx-auto ${
                            submission.status === 'graded' ? 'btn-secondary' : 'btn-primary'
                          }`}
                        >
                          <Icon name="edit" className="w-4 h-4" />
                          {submission.status === 'graded' ? 'Update' : 'Grade'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Icon name="file" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No submissions yet.</p>
              </div>
            )}
          </div>
        </Modal>

        {/* View Submission File Modal */}
        <Modal
          isOpen={viewSubmissionModal.isOpen}
          onClose={() => setViewSubmissionModal({ isOpen: false, submission: null })}
          title={`Submission - ${viewSubmissionModal.submission?.studentId?.name || 'Student'}`}
          size="lg"
        >
          {viewSubmissionModal.submission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Student</p>
                  <p className="font-medium">{viewSubmissionModal.submission.studentId.name}</p>
                  <p className="text-xs text-gray-500">{viewSubmissionModal.submission.studentId.idNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Submitted</p>
                  <p className="font-medium">
                    {new Date(viewSubmissionModal.submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {viewSubmissionModal.submission.comments && (
                <div>
                  <p className="text-gray-500 mb-1 text-sm">Comments</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{viewSubmissionModal.submission.comments}</p>
                </div>
              )}

              {viewSubmissionModal.submission.fileUrl && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="file" className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{viewSubmissionModal.submission.fileName || 'Submission File'}</span>
                      {viewSubmissionModal.submission.fileSize && (
                        <span className="text-xs text-gray-500">
                          ({(viewSubmissionModal.submission.fileSize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        let cleanUrl = viewSubmissionModal.submission.fileUrl;
                        if (cleanUrl.startsWith('/api')) {
                          cleanUrl = cleanUrl.replace('/api', '');
                        }
                        if (!cleanUrl.startsWith('/')) {
                          cleanUrl = '/' + cleanUrl;
                        }
                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
                        const fileUrl = `${baseUrl}${cleanUrl}`;
                        window.open(fileUrl, '_blank');
                      }}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Icon name="download" className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  {viewSubmissionModal.submission.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) && (
                    <div className="mt-3">
                      {(() => {
                        let cleanUrl = viewSubmissionModal.submission.fileUrl;
                        if (cleanUrl.startsWith('/api')) {
                          cleanUrl = cleanUrl.replace('/api', '');
                        }
                        if (!cleanUrl.startsWith('/')) {
                          cleanUrl = '/' + cleanUrl;
                        }
                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
                        const imageUrl = `${baseUrl}${cleanUrl}`;
                        return (
                          <img
                            src={imageUrl}
                            alt="Submission"
                            className="w-full rounded-lg border border-gray-200 max-h-96 object-contain bg-white"
                          />
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {viewSubmissionModal.submission.score !== undefined && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Score:</strong> <span className="text-blue-600 font-bold text-lg">{viewSubmissionModal.submission.score}/100</span>
                  </p>
                  {viewSubmissionModal.submission.feedback && (
                    <div>
                      <p className="text-sm text-gray-700 mb-1"><strong>Feedback:</strong></p>
                      <p className="text-sm bg-white p-3 rounded-lg">{viewSubmissionModal.submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Grading Modal */}
        <Modal
          isOpen={gradingModal.isOpen}
          onClose={closeGradingModal}
          title={`Grade Submission - ${gradingModal.submission?.studentId?.name || 'Student'}`}
        >
          <form onSubmit={(e) => { e.preventDefault(); gradeSubmission(); }} className="space-y-4">
            <div>
              <label className="input-label">Score (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={gradingModal.score}
                onChange={(e) => setGradingModal({ ...gradingModal, score: e.target.value })}
                className="input-field"
                required
                placeholder="Enter score"
              />
            </div>

            <div>
              <label className="input-label">Feedback (Optional)</label>
              <textarea
                value={gradingModal.feedback}
                onChange={(e) => setGradingModal({ ...gradingModal, feedback: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" className="btn-primary flex-1">
                Save Grade
              </button>
              <button
                type="button"
                onClick={closeGradingModal}
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
          title="Delete Material"
          message={`Are you sure you want to delete "${selectedMaterial?.title}"? This action cannot be undone.`}
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

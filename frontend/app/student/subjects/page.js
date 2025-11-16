'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { materialAPI, submissionAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Learning Material', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Announcements', href: '/student/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentSubjects() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [submissions, setSubmissions] = useState({}); // materialId -> submission object
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (user?.classId) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMaterials = async () => {
    try {
      const { data } = await materialAPI.getAll({ classId: user.classId });
      setMaterials(data);
      
      // Fetch all student submissions and map by materialId
      try {
        const { data: allSubmissions } = await submissionAPI.getStudentSubmissions(user._id);
        const submissionsMap = {};
        if (allSubmissions && Array.isArray(allSubmissions)) {
          allSubmissions.forEach(submission => {
            const materialId = submission.materialId?._id || submission.materialId;
            if (materialId) {
              // Use the latest submission (by submittedAt) or the graded one if it exists
              const existing = submissionsMap[materialId];
              if (!existing) {
                submissionsMap[materialId] = submission;
              } else {
                // Prefer graded submissions, or latest if both are graded or both are not graded
                const isNewGraded = submission.status === 'graded' || submission.score !== undefined;
                const isExistingGraded = existing.status === 'graded' || existing.score !== undefined;
                
                if (isNewGraded && !isExistingGraded) {
                  submissionsMap[materialId] = submission;
                } else if (!isNewGraded && isExistingGraded) {
                  // Keep existing graded one
                } else {
                  // Both same status, use latest
                  if (new Date(submission.submittedAt) > new Date(existing.submittedAt)) {
                    submissionsMap[materialId] = submission;
                  }
                }
              }
            }
          });
        }
        setSubmissions(submissionsMap);
        // Debug: Log submissions to check graded status
        console.log('Fetched submissions:', submissionsMap);
      } catch (error) {
        console.log('No submissions found or error fetching:', error);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type - Images, PDF, DOC, DOCX
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      // Check both MIME type and file extension
      if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
        setToast({ isOpen: true, message: 'Invalid file type. Please upload Image, PDF, DOC, or DOCX files only.', type: 'error' });
        return;
      }
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setToast({ isOpen: true, message: 'File size must be less than 10MB', type: 'error' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setToast({ isOpen: true, message: 'Please select a file to submit', type: 'error' });
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('submission', file);
      formData.append('materialId', selectedMaterial._id);
      formData.append('studentId', user._id);
      formData.append('comments', comments || '');

      const { data: newSubmission } = await submissionAPI.create(formData);
      setToast({ isOpen: true, message: 'Assignment submitted successfully! ✓', type: 'success' });
      setIsSubmitModalOpen(false);
      resetForm();
      // Update submissions state
      setSubmissions(prev => ({
        ...prev,
        [selectedMaterial._id]: newSubmission
      }));
      await fetchMaterials();
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Failed to submit assignment', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (material) => {
    setSelectedMaterial(material);
    setIsSubmitModalOpen(true);
  };

  const openViewModal = (material) => {
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  const handleDownload = async (material) => {
    if (!material.fileUrl) {
      setToast({ isOpen: true, message: 'File URL not available', type: 'error' });
      return;
    }
    
    try {
      // Clean URL - remove /api if it exists, ensure it starts with /
      let cleanUrl = material.fileUrl;
      if (cleanUrl.startsWith('/api')) {
        cleanUrl = cleanUrl.replace('/api', '');
      }
      if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
      }
      
      // Use base URL without /api since uploads are served directly at /uploads
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
      const fileUrl = `${baseUrl}${cleanUrl}`;
      
      // Try to download using fetch (with credentials for authenticated files if needed)
      const response = await fetch(fileUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies/auth headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = material.fileName || material.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      
      setToast({ isOpen: true, message: 'Download started! ✓', type: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: open in new tab (browser will handle download)
      let cleanUrl = material.fileUrl;
      if (cleanUrl.startsWith('/api')) {
        cleanUrl = cleanUrl.replace('/api', '');
      }
      if (!cleanUrl.startsWith('/')) {
        cleanUrl = '/' + cleanUrl;
      }
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
      const fileUrl = `${baseUrl}${cleanUrl}`;
      
      // Open in new tab as fallback
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({ isOpen: true, message: 'Opening file in new tab...', type: 'info' });
    }
  };

  const resetForm = () => {
    setFile(null);
    setComments('');
  };

  const getFileIcon = (type) => {
    if (type === 'pdf') return 'file';
    if (type === 'mp4') return 'file';
    return 'file';
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="Learning Material">

        {loading ? (
          <Loading />
        ) : !user?.classId ? (
          <div className="card text-center py-12">
            <Icon name="warning" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">You are not assigned to any class yet.</p>
            <p className="text-xs text-gray-400 mt-1">Please contact your administrator.</p>
          </div>
        ) : (
          <>
            {materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material._id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name={getFileIcon(material.fileType)} className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{material.title}</h3>
                            <span className="badge-info flex-shrink-0">{material.subject}</span>
                            {material.type === 'assignment' && (
                              <span className="badge-warning flex-shrink-0">Assignment</span>
                            )}
                            {material.type === 'assignment' && submissions[material._id] && (
                              <>
                                {(submissions[material._id].status === 'graded' || 
                                  (typeof submissions[material._id].score === 'number' && submissions[material._id].score >= 0)) ? (
                                  <span className="badge-success flex-shrink-0 flex items-center gap-1">
                                  Checked
                                  </span>
                                ) : submissions[material._id].status === 'submitted' || submissions[material._id].status === 'late' ? (
                                  <span className="badge-info flex-shrink-0">Submitted</span>
                                ) : null}
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Icon name="calendar" className="w-3 h-3" />
                              {new Date(material.createdAt).toLocaleDateString()}
                            </span>
                            {material.dueDate && (
                              <span className="flex items-center gap-1 text-red-600 font-medium">
                                <Icon name="warning" className="w-3 h-3" />
                                Due: {new Date(material.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {material.type === 'assignment' && submissions[material._id] && 
                            (submissions[material._id].status === 'graded' || 
                             (typeof submissions[material._id].score === 'number' && submissions[material._id].score >= 0)) && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-1">Your Grade</p>
                                    <p className="text-lg font-bold text-green-700">
                                      {typeof submissions[material._id].score === 'number' && submissions[material._id].score >= 0
                                        ? `${submissions[material._id].score}/100` 
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  {submissions[material._id].feedback && (
                                    <div className="flex-1 border-l border-green-200 pl-3">
                                      <p className="text-xs text-gray-600 mb-1">Teacher Feedback</p>
                                      <p className="text-sm text-gray-700">{submissions[material._id].feedback}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openViewModal(material)}
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <Icon name="view" className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(material)}
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          Download
                        </button>
                        {material.type === 'assignment' && 
                          (!submissions[material._id] || 
                           (submissions[material._id].status !== 'graded' && 
                            !(typeof submissions[material._id].score === 'number' && submissions[material._id].score >= 0))) && (
                          <button
                            onClick={() => openSubmitModal(material)}
                            className="btn-primary text-xs flex items-center gap-1"
                            disabled={submissions[material._id] && 
                              (submissions[material._id].status === 'submitted' || 
                               submissions[material._id].status === 'late') &&
                              submissions[material._id].status !== 'graded' &&
                              submissions[material._id].score === undefined}
                          >
                            <Icon name="upload" className="w-4 h-4" />
                            {submissions[material._id] ? 'Resubmit' : 'Submit'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="book" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No learning materials available yet.</p>
              </div>
            )}
          </>
        )}

        {/* Submit Assignment Modal */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => {
            setIsSubmitModalOpen(false);
            resetForm();
          }}
          title="Submit Assignment"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">{selectedMaterial?.title}</h4>
              <p className="text-xs text-gray-600">{selectedMaterial?.subject}</p>
            </div>

            <div>
              <label className="input-label">Upload Submission * (Image, PDF, DOC, DOCX - Max 10MB)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="submission-file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <label htmlFor="submission-file-input" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Icon name="upload" className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {file ? 'File Selected: ' + file.name : 'Click to Upload File'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
              {file && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="check" className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{file.name}</p>
                        <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove file"
                    >
                      <Icon name="close" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Comments (Optional)</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Add any comments or notes for your teacher..."
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  resetForm();
                }}
                className="btn-outline flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* View Material Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={selectedMaterial?.title}
          size="lg"
        >
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-info">{selectedMaterial.subject}</span>
                  {selectedMaterial.type === 'assignment' && (
                    <span className="badge-warning">Assignment</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-3">{selectedMaterial.description || 'No description provided.'}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Icon name="calendar" className="w-3 h-3" />
                    Uploaded: {new Date(selectedMaterial.createdAt).toLocaleDateString()}
                  </span>
                  {selectedMaterial.dueDate && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <Icon name="warning" className="w-3 h-3" />
                      Due: {new Date(selectedMaterial.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="file" className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{selectedMaterial.fileName || 'Material File'}</span>
                  </div>
                  {selectedMaterial.fileSize && (
                    <span className="text-xs text-gray-500">
                      {(selectedMaterial.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>

                {selectedMaterial.fileUrl && (
                  <div className="mt-4">
                    {(() => {
                      // Clean URL - remove /api if it exists, ensure it starts with /
                      let cleanUrl = selectedMaterial.fileUrl;
                      if (cleanUrl.startsWith('/api')) {
                        cleanUrl = cleanUrl.replace('/api', '');
                      }
                      if (!cleanUrl.startsWith('/')) {
                        cleanUrl = '/' + cleanUrl;
                      }
                      
                      // Use base URL without /api since uploads are served directly at /uploads
                      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
                      const fileUrl = `${baseUrl}${cleanUrl}`;
                      
                      if (selectedMaterial.fileUrl.endsWith('.mp4')) {
                        return (
                          <video
                            src={fileUrl}
                            controls
                            className="w-full rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else if (selectedMaterial.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        return (
                          <img
                            src={fileUrl}
                            alt={selectedMaterial.title}
                            className="w-full rounded-lg"
                          />
                        );
                      }
                      return (
                        <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                          <Icon name="file" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">This file cannot be previewed in the browser.</p>
                          <button
                            onClick={() => handleDownload(selectedMaterial)}
                            className="btn-primary inline-flex items-center gap-2"
                          >
                            <Icon name="download" className="w-4 h-4" />
                            Download to View
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

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

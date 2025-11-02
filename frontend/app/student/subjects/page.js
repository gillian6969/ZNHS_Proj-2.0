'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { materialAPI, submissionAPI } from '@/utils/api';
import Loading from '@/components/Loading';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentSubjects() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState('');

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
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files only.');
        return;
      }
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('submission', file);
      formData.append('materialId', selectedMaterial._id);
      formData.append('studentId', user._id);
      formData.append('comments', comments);

      await submissionAPI.create(formData);
      alert('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (material) => {
    setSelectedMaterial(material);
    setIsSubmitModalOpen(true);
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
      <ModernSidebar menuItems={studentMenu}>
        <h1 className="mb-5">My Subjects</h1>

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
                            {material.materialType === 'assignment' && (
                              <span className="badge-warning flex-shrink-0">Assignment</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
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
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${material.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          Download
                        </a>
                        {material.materialType === 'assignment' && (
                          <button
                            onClick={() => openSubmitModal(material)}
                            className="btn-primary text-xs flex items-center gap-1"
                          >
                            <Icon name="upload" className="w-4 h-4" />
                            Submit
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
              <label className="input-label">Upload File * (PDF, DOC, DOCX, JPG, PNG - Max 10MB)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="input-field"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              {file && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Icon name="check" className="w-3 h-3" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
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
      </ModernSidebar>
    </ProtectedRoute>
  );
}

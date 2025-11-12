'use client';

import Icon from '@/components/Icon';
import Loading from '@/components/Loading';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { classAPI, gradeAPI } from '@/utils/api';
import { exportToCSV } from '@/utils/exportUtils';
import { useEffect, useState } from 'react';

const staffMenu = [
  { label: 'Dashboard', href: '/staff/dashboard', iconName: 'dashboard' },
  { label: 'Gradebook', href: '/staff/gradebook', iconName: 'grades' },
  { label: 'Attendance', href: '/staff/attendance', iconName: 'calendar' },
  { label: 'Materials', href: '/staff/materials', iconName: 'book' },
  { label: 'Announcements', href: '/staff/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StaffGradebook() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [advisoryClasses, setAdvisoryClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [viewMode, setViewMode] = useState('subject'); // 'subject' or 'advisory'
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [expandedStudents, setExpandedStudents] = useState({});

  // Get teacher's subject from selected class (only for subject classes, not advisory)
  const getTeacherSubject = () => {
    if (!selectedClass || !user || viewMode === 'advisory') return null;
    const currentClass = classes.find(c => c._id === selectedClass);
    if (!currentClass || !currentClass.teachers) return null;
    
    // Find teacher in class and get their assigned subject
    const teacherAssignment = currentClass.teachers.find(
      t => t.teacherId && t.teacherId._id === user._id
    );
    
    return teacherAssignment?.subject || null;
  };

  const teacherSubject = getTeacherSubject();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (viewMode === 'subject' && classes.length > 0) {
      // Reset to first subject class if not already on one
      if (!classes.find(c => c._id === selectedClass)) {
        setSelectedClass(classes[0]._id);
      }
    } else if (viewMode === 'advisory' && advisoryClasses.length > 0) {
      // Reset to first advisory class if not already on one
      if (!advisoryClasses.find(c => c._id === selectedClass)) {
        setSelectedClass(advisoryClasses[0]._id);
      }
    }
  }, [viewMode, classes, advisoryClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndGrades();
    }
  }, [selectedClass, viewMode]);

  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll();
      // Filter classes where teacher is assigned
      const teacherClasses = data.filter(cls => {
        return cls.teachers?.some(
          t => t.teacherId && (t.teacherId._id === user?._id || t.teacherId.toString() === user?._id)
        );
      });
      // Filter advisory classes where teacher is the adviser
      const advClasses = data.filter(cls => {
        return cls.adviser && (
          (typeof cls.adviser === 'object' && cls.adviser._id === user?._id) ||
          cls.adviser.toString() === user?._id
        );
      });
      setClasses(teacherClasses);
      setAdvisoryClasses(advClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]._id);
        setViewMode('subject');
      } else if (advClasses.length > 0) {
        setSelectedClass(advClasses[0]._id);
        setViewMode('advisory');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndGrades = async () => {
    try {
      const classData = await classAPI.getById(selectedClass);
      setStudents(classData.data.students || []);

      if (viewMode === 'advisory') {
        // For advisory class, get all subjects for all students
        const gradesData = {};
        for (const student of (classData.data.students || [])) {
          const studentGrades = await gradeAPI.getAll({ 
            studentId: student._id,
            schoolYear: '2024-2025' 
          });
          
          if (studentGrades.data.length > 0) {
            // Group by subject
            const subjectGrades = {};
            studentGrades.data.forEach(grade => {
              subjectGrades[grade.subject] = grade;
            });
            gradesData[student._id] = subjectGrades;
          } else {
            gradesData[student._id] = {};
          }
        }
        setGrades(gradesData);
      } else {
        // For subject class, get only teacher's subject grades
        if (!teacherSubject) {
          setToast({ isOpen: true, message: 'No subject assigned for this class', type: 'error' });
          return;
        }

        const gradesData = {};
        for (const student of (classData.data.students || [])) {
          const studentGrades = await gradeAPI.getAll({ 
            studentId: student._id, 
            subject: teacherSubject,
            schoolYear: '2024-2025' 
          });
          
          if (studentGrades.data.length > 0) {
            gradesData[student._id] = studentGrades.data[0];
          } else {
            // Initialize empty grade structure
            gradesData[student._id] = {
              q1: null,
              q2: null,
              q3: null,
              q4: null,
              final: null,
            };
          }
        }
        setGrades(gradesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ isOpen: true, message: 'Failed to load grades', type: 'error' });
    }
  };

  const handleCellClick = (studentId, quarter) => {
    setEditingCell({ studentId, quarter });
  };

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleCellChange = (value, studentId, quarter) => {
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 100)) return;

    setGrades(prev => {
      const newGrades = { ...prev };
      if (!newGrades[studentId]) {
        newGrades[studentId] = { q1: null, q2: null, q3: null, q4: null, final: null };
      }
      
      newGrades[studentId] = {
        ...newGrades[studentId],
        [quarter]: value === '' ? null : numValue,
      };

      // Auto-calculate final grade
      const { q1, q2, q3, q4 } = newGrades[studentId];
      if (q1 !== null && q2 !== null && q3 !== null && q4 !== null) {
        newGrades[studentId].final = Math.round((q1 + q2 + q3 + q4) / 4);
      } else {
        newGrades[studentId].final = null;
      }

      return newGrades;
    });
  };

  const handleSaveGrade = async (studentId) => {
    setSaving(true);
    try {
      const gradeData = grades[studentId];
      if (!gradeData) {
        setSaving(false);
        return;
      }

      if (!teacherSubject) {
        setToast({ isOpen: true, message: 'No subject assigned for this class', type: 'error' });
        setSaving(false);
        return;
      }

      const payload = {
        studentId,
        subject: teacherSubject,
        q1: gradeData.q1 || 0,
        q2: gradeData.q2 || 0,
        q3: gradeData.q3 || 0,
        q4: gradeData.q4 || 0,
        final: gradeData.final || 0,
        schoolYear: '2024-2025',
      };

      if (gradeData._id) {
        // Update existing grade
        await gradeAPI.update(gradeData._id, payload);
      } else {
        // Create new grade
        await gradeAPI.create(payload);
      }

      setToast({ isOpen: true, message: 'Grade saved successfully! ✓', type: 'success' });
      setEditingCell(null);
      fetchStudentsAndGrades();
    } catch (error) {
      setToast({ isOpen: true, message: 'Failed to save grade', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = [];
    students.forEach(student => {
      const grade = grades[student._id];
      exportData.push({
        Student: student.name,
        'ID Number': student.idNumber,
        Subject: teacherSubject,
        'Q1': grade?.q1 || '-',
        'Q2': grade?.q2 || '-',
        'Q3': grade?.q3 || '-',
        'Q4': grade?.q4 || '-',
        'Final': grade?.final || '-',
      });
    });
    exportToCSV(exportData, `gradebook-${teacherSubject}`);
  };

  const currentClass = viewMode === 'advisory' 
    ? advisoryClasses.find(c => c._id === selectedClass)
    : classes.find(c => c._id === selectedClass);

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu} pageTitle="Gradebook">
        <div className="flex justify-between items-center mb-5">
          <button onClick={handleExport} className="btn-primary flex items-center gap-2" disabled={!selectedClass}>
            <Icon name="download" className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Class Filter */}
            {(classes.length > 0 || advisoryClasses.length > 0) && (
              <div className="card mb-5 space-y-4">
                {/* View Mode Toggle */}
                {advisoryClasses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('subject')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'subject'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Subject Classes
                    </button>
                    <button
                      onClick={() => setViewMode('advisory')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'advisory'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Advisory Class
                    </button>
                  </div>
                )}

                {/* Class Selector */}
                {viewMode === 'subject' && classes.length > 0 && (
                  <div>
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

                {viewMode === 'advisory' && advisoryClasses.length > 0 && (
                  <div>
                    <label className="input-label">Advisory Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="input-field max-w-md"
                    >
                      {advisoryClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.className} ({cls.students?.length || 0} students)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Gradebook Table */}
            {selectedClass ? (
              <div className="card">
                <div className="mb-4">
                  <h3>{currentClass?.className} {viewMode === 'advisory' ? '(Advisory)' : `- ${teacherSubject}`}</h3>
                  <p className="text-xs text-gray-600">
                    {viewMode === 'advisory' 
                      ? 'Viewing all subject grades for your advisory class. You cannot edit grades here.'
                      : 'Click on a cell to edit. Press Enter or click Save to save changes.'}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  {students.length > 0 ? (
                    viewMode === 'advisory' ? (
                      // Advisory view - expandable table matching admin grades page
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2"></th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Student Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">ID Number</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Subject</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q1</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q2</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q3</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q4</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Final</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => {
                            const studentId = student._id;
                            const isExpanded = expandedStudents[studentId] || false;
                            const studentGrades = grades[studentId] || {};
                            const subjectsList = Object.keys(studentGrades).sort();
                            const rowSpan = isExpanded && subjectsList.length > 0 ? subjectsList.length : 1;

                            return (
                              <>
                                {/* Main student row */}
                                <tr key={`student-${studentId}`} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 align-middle" rowSpan={rowSpan}>
                                    <button
                                      onClick={() => toggleStudentExpansion(studentId)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title={isExpanded ? "Collapse" : "Expand"}
                                    >
                                      <Icon 
                                        name="arrow-down" 
                                        className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                      />
                                    </button>
                                  </td>
                                  <td className="px-3 py-2 font-medium align-middle" rowSpan={rowSpan}>
                                    <div className="flex items-center h-full py-3">
                                      {student.name}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 align-middle" rowSpan={rowSpan}>
                                    <div className="flex items-center h-full py-3">
                                      {student.idNumber || 'N/A'}
                                    </div>
                                  </td>
                                  {!isExpanded ? (
                                    <td colSpan="7" className="px-3 py-2 text-gray-400 text-sm italic align-middle">
                                      Click to view grades
                                    </td>
                                  ) : (
                                    // First subject row - continues on same row
                                    subjectsList.length > 0 && (
                                      <>
                                        <td className="px-3 py-2 font-medium align-middle">{subjectsList[0]}</td>
                                        <td className="px-3 py-2 text-center align-middle">{studentGrades[subjectsList[0]]?.q1 || '-'}</td>
                                        <td className="px-3 py-2 text-center align-middle">{studentGrades[subjectsList[0]]?.q2 || '-'}</td>
                                        <td className="px-3 py-2 text-center align-middle">{studentGrades[subjectsList[0]]?.q3 || '-'}</td>
                                        <td className="px-3 py-2 text-center align-middle">{studentGrades[subjectsList[0]]?.q4 || '-'}</td>
                                        <td className="px-3 py-2 text-center font-bold align-middle">{studentGrades[subjectsList[0]]?.final || '-'}</td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          {studentGrades[subjectsList[0]]?.final >= 75 ? (
                                            <span className="badge-success">Passed</span>
                                          ) : studentGrades[subjectsList[0]]?.final ? (
                                            <span className="badge-danger">Failed</span>
                                          ) : (
                                            <span className="badge-warning">Pending</span>
                                          )}
                                        </td>
                                      </>
                                    )
                                  )}
                                </tr>

                                {/* Additional subject rows */}
                                {isExpanded && subjectsList.length > 1 && (
                                  subjectsList.slice(1).map((subject, idx) => (
                                    <tr key={`${studentId}-${subject}-${idx}`} className="bg-gray-50">
                                      <td className="px-3 py-2 font-medium align-middle">{subject}</td>
                                      <td className="px-3 py-2 text-center align-middle">{studentGrades[subject]?.q1 || '-'}</td>
                                      <td className="px-3 py-2 text-center align-middle">{studentGrades[subject]?.q2 || '-'}</td>
                                      <td className="px-3 py-2 text-center align-middle">{studentGrades[subject]?.q3 || '-'}</td>
                                      <td className="px-3 py-2 text-center align-middle">{studentGrades[subject]?.q4 || '-'}</td>
                                      <td className="px-3 py-2 text-center font-bold align-middle">{studentGrades[subject]?.final || '-'}</td>
                                      <td className="px-3 py-2 text-center align-middle">
                                        {studentGrades[subject]?.final >= 75 ? (
                                          <span className="badge-success">Passed</span>
                                        ) : studentGrades[subject]?.final ? (
                                          <span className="badge-danger">Failed</span>
                                        ) : (
                                          <span className="badge-warning">Pending</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}

                                {/* No grades message when expanded */}
                                {isExpanded && subjectsList.length === 0 && (
                                  <tr className="bg-gray-50">
                                    <td colSpan="10" className="px-3 py-2 text-center text-gray-500 text-sm align-middle">
                                      No grades available for this student
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      // Subject view - single subject editable table
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Student</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q1</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q2</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q3</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Q4</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => {
                            const grade = grades[student._id] || {};
                            return (
                              <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div>
                                    <p className="font-medium text-sm">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.idNumber}</p>
                                  </div>
                                </td>
                                {['q1', 'q2', 'q3', 'q4'].map((quarter) => (
                                  <td key={quarter} className="px-3 py-2 text-center">
                                    {editingCell?.studentId === student._id && 
                                     editingCell?.quarter === quarter ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={grade[quarter] || ''}
                                        onChange={(e) => handleCellChange(e.target.value, student._id, quarter)}
                                        onBlur={() => {
                                          setEditingCell(null);
                                          handleSaveGrade(student._id);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveGrade(student._id);
                                          }
                                        }}
                                        className="w-16 px-2 py-1 text-sm border-2 border-blue-500 rounded text-center focus:outline-none"
                                        autoFocus
                                      />
                                    ) : (
                                      <span
                                        onClick={() => handleCellClick(student._id, quarter)}
                                        className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded inline-block min-w-[40px] text-sm"
                                      >
                                        {grade[quarter] || '-'}
                                      </span>
                                    )}
                                  </td>
                                ))}
                                <td className="px-3 py-2 text-center font-bold text-sm">
                                  {grade.final || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No students in this class.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Icon name="class" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No classes available.</p>
              </div>
            )}
          </>
        )}

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

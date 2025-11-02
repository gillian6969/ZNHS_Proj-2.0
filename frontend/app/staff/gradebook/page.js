'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { classAPI, gradeAPI } from '@/utils/api';
import { exportToCSV } from '@/utils/exportUtils';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

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
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const teacherSubject = user?.subject; // Teacher can only edit their subject

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndGrades();
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

  const fetchStudentsAndGrades = async () => {
    try {
      const classData = await classAPI.getById(selectedClass);
      setStudents(classData.data.students);

      // Fetch grades for teacher's subject only
      const gradesData = {};
      for (const student of classData.data.students) {
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCellClick = (studentId, quarter) => {
    setEditingCell({ studentId, quarter });
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
      if (!gradeData) return;

      const payload = {
        studentId,
        subject: teacherSubject,
        q1: gradeData.q1,
        q2: gradeData.q2,
        q3: gradeData.q3,
        q4: gradeData.q4,
        final: gradeData.final,
        schoolYear: '2024-2025',
      };

      if (gradeData._id) {
        // Update existing grade
        await gradeAPI.update(gradeData._id, payload);
      } else {
        // Create new grade
        await gradeAPI.create(payload);
      }

      alert('Grade saved successfully!');
      setEditingCell(null);
      fetchStudentsAndGrades();
    } catch (error) {
      alert('Failed to save grade');
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

  const currentClass = classes.find(c => c._id === selectedClass);

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>Gradebook - {teacherSubject}</h1>
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

            {/* Gradebook Table */}
            {selectedClass ? (
              <div className="card">
                <div className="mb-4">
                  <h3>{currentClass?.className} - {teacherSubject}</h3>
                  <p className="text-xs text-gray-600">Click on a cell to edit. Press Enter or click Save to save changes.</p>
                </div>

                <div className="overflow-x-auto">
                  {students.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Student</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Q1</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Q2</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Q3</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Q4</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Final</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Action</th>
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
                                      onBlur={() => setEditingCell(null)}
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
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleSaveGrade(student._id)}
                                  disabled={saving}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50 flex items-center gap-1 mx-auto"
                                >
                                  <Icon name="save" className="w-4 h-4" />
                                  Save
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
      </ModernSidebar>
    </ProtectedRoute>
  );
}

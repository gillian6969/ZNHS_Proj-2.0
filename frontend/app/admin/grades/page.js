'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { gradeAPI, classAPI } from '@/utils/api';
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

export default function AdminGrades() {
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    subject: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  // Track expanded state for each student: { studentId: true/false }
  const [expandedStudents, setExpandedStudents] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, grades]);

  const fetchData = async () => {
    try {
      const [gradesRes, classesRes] = await Promise.all([
        gradeAPI.getAll(),
        classAPI.getAll(),
      ]);

      setGrades(gradesRes.data);
      setClasses(classesRes.data);
      setFilteredGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ isOpen: true, message: 'Failed to fetch grades', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...grades];

    if (filters.grade) {
      filtered = filtered.filter(g => g.studentId?.gradeLevel === filters.grade);
    }

    if (filters.section) {
      filtered = filtered.filter(g => g.studentId?.section === filters.section);
    }

    if (filters.subject) {
      filtered = filtered.filter(g => g.subject === filters.subject);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(g =>
        g.studentId?.name?.toLowerCase().includes(searchLower) ||
        g.studentId?.idNumber?.toLowerCase().includes(searchLower) ||
        g.subject?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredGrades(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({ grade: '', section: '', subject: '', search: '' });
  };

  // Group grades by class (grade + section)
  const groupedByClass = filteredGrades.reduce((acc, grade) => {
    const gradeLevel = grade.studentId?.gradeLevel || 'Unknown';
    const section = grade.studentId?.section || 'Unknown';
    const key = `${gradeLevel}-${section}`;
    
    if (!acc[key]) {
      acc[key] = {
        gradeLevel,
        section,
        students: {},
      };
    }

    const studentId = grade.studentId?._id || grade.studentId;
    if (!acc[key].students[studentId]) {
      acc[key].students[studentId] = {
        student: grade.studentId,
        grades: [],
      };
    }

    acc[key].students[studentId].grades.push(grade);
    return acc;
  }, {});

  const allSubjects = [...new Set(grades.map(g => g.subject).filter(Boolean))].sort();

  // Toggle expanded state for a student
  const toggleStudentExpansion = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="View Grades">
        {/* Filter Toggle Button */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Grades by Class</h3>
            <span className="text-xs text-gray-500">
              ({Object.keys(groupedByClass).length} classes)
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

        {/* Filters */}
        {showFilters && (
          <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                  {GRADE_LEVELS.map(grade => (
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
                <label className="input-label">Subject</label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Subjects</option>
                  {allSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
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
                  placeholder="Student name or ID..."
                />
              </div>
            </div>
            <div className="mt-3">
              <button onClick={clearFilters} className="btn-outline text-sm">
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedByClass).length > 0 ? (
              Object.entries(groupedByClass).map(([key, classData]) => (
                <div key={key} className="card">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {classData.gradeLevel} - {classData.section}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {Object.keys(classData.students).length} students
                      </p>
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Student Name</th>
                          <th>ID Number</th>
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
                        {Object.values(classData.students).map(({ student, grades: studentGrades }) => {
                          const studentId = student?._id || student;
                          const isExpanded = expandedStudents[studentId] || false;

                          const rowSpan = isExpanded && studentGrades.length > 0 ? studentGrades.length : 1;
                          
                          return (
                            <>
                              {/* Main student row - always visible */}
                              <tr key={`student-${studentId}`} className="hover:bg-gray-50">
                                <td className="align-middle" rowSpan={isExpanded ? rowSpan : 1}>
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
                                <td className="font-medium align-middle" rowSpan={isExpanded ? rowSpan : 1}>
                                  <div className="flex items-center h-full py-3">
                                    {student?.name || 'N/A'}
                                  </div>
                                </td>
                                <td className="align-middle" rowSpan={isExpanded ? rowSpan : 1}>
                                  <div className="flex items-center h-full py-3">
                                    {student?.idNumber || 'N/A'}
                                  </div>
                                </td>
                                {!isExpanded ? (
                                  <td colSpan="7" className="text-gray-400 text-sm italic align-middle">
                                    Click to view grades
                                  </td>
                                ) : (
                                  // First grade row - continues on same row
                                  studentGrades.length > 0 && (
                                    <>
                                      <td className="font-medium align-middle">{studentGrades[0].subject}</td>
                                      <td className="text-center align-middle">{studentGrades[0].q1 || '-'}</td>
                                      <td className="text-center align-middle">{studentGrades[0].q2 || '-'}</td>
                                      <td className="text-center align-middle">{studentGrades[0].q3 || '-'}</td>
                                      <td className="text-center align-middle">{studentGrades[0].q4 || '-'}</td>
                                      <td className="text-center font-bold align-middle">{studentGrades[0].final || '-'}</td>
                                      <td className="text-center align-middle">
                                        {studentGrades[0].final >= 75 ? (
                                          <span className="badge-success">Passed</span>
                                        ) : studentGrades[0].final ? (
                                          <span className="badge-danger">Failed</span>
                                        ) : (
                                          <span className="badge-warning">Pending</span>
                                        )}
                                      </td>
                                    </>
                                  )
                                )}
                              </tr>
                              
                              {/* Additional grade rows (if more than 1 grade) */}
                              {isExpanded && studentGrades.length > 1 && (
                                studentGrades.slice(1).map((grade, idx) => (
                                  <tr key={`${grade._id}-${idx + 1}`} className="bg-gray-50">
                                    <td className="font-medium align-middle">{grade.subject}</td>
                                    <td className="text-center align-middle">{grade.q1 || '-'}</td>
                                    <td className="text-center align-middle">{grade.q2 || '-'}</td>
                                    <td className="text-center align-middle">{grade.q3 || '-'}</td>
                                    <td className="text-center align-middle">{grade.q4 || '-'}</td>
                                    <td className="text-center font-bold align-middle">{grade.final || '-'}</td>
                                    <td className="text-center align-middle">
                                      {grade.final >= 75 ? (
                                        <span className="badge-success">Passed</span>
                                      ) : grade.final ? (
                                        <span className="badge-danger">Failed</span>
                                      ) : (
                                        <span className="badge-warning">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                              
                              {/* No grades message when expanded */}
                              {isExpanded && studentGrades.length === 0 && (
                                <tr className="bg-gray-50">
                                  <td colSpan="10" className="text-center py-4 text-gray-500 text-sm align-middle">
                                    No grades available for this student
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-12">
                <Icon name="grades" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No grades found</p>
              </div>
            )}
          </div>
        )}

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


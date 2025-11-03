'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { gradeAPI, classAPI } from '@/utils/api';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';
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

export default function StudentGrades() {
  const { user } = useAuth();
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGradesAndSubjects();
    }
  }, [user]);

  const fetchGradesAndSubjects = async () => {
    try {
      // Fetch student's class to get all subjects
      let subjectsWithTeachers = [];
      if (user.classId) {
        try {
          const { data: classData } = await classAPI.getById(user.classId);
          if (classData && classData.teachers) {
            subjectsWithTeachers = classData.teachers.map(t => ({
              subject: t.subject,
              teacherName: t.teacherId?.name || 'N/A',
              teacherId: t.teacherId?._id || t.teacherId,
              _id: null, // No grade yet
            }));
          }
        } catch (error) {
          console.error('Error fetching class:', error);
        }
      }

      // Fetch existing grades
      const { data: gradesData } = await gradeAPI.getAll({ studentId: user._id });
      
      // Merge subjects with grades
      const merged = subjectsWithTeachers.map(subject => {
        const existingGrade = gradesData.find(g => g.subject === subject.subject);
        if (existingGrade) {
          return {
            ...subject,
            ...existingGrade,
          };
        }
        return subject;
      });

      // Add any grades that don't match a subject (fallback)
      gradesData.forEach(grade => {
        if (!merged.find(m => m.subject === grade.subject)) {
          merged.push({
            subject: grade.subject,
            teacherName: grade.createdBy?.name || 'N/A',
            teacherId: grade.createdBy?._id,
            ...grade,
          });
        }
      });

      setAllSubjects(merged);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = allSubjects.map(item => ({
      Subject: item.subject,
      Teacher: item.teacherName,
      'Quarter 1': item.q1 || '-',
      'Quarter 2': item.q2 || '-',
      'Quarter 3': item.q3 || '-',
      'Quarter 4': item.q4 || '-',
      'Final Grade': item.final || '-',
    }));
    exportToCSV(exportData, `grades-${user.name}`);
  };

  const handleExportPDF = () => {
    exportToPDF(allSubjects, user.name, 'Grades Report');
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu} pageTitle="My Grades">
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
              <Icon name="download" className="w-4 h-4" />
              CSV
            </button>
            <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
              <Icon name="download" className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th className="text-center">Q1</th>
                  <th className="text-center">Q2</th>
                  <th className="text-center">Q3</th>
                  <th className="text-center">Q4</th>
                  <th className="text-center">Final</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.length > 0 ? (
                  allSubjects.map((item, index) => (
                    <tr key={item._id || `subject-${index}`}>
                      <td className="font-medium">{item.subject}</td>
                      <td>{item.teacherName}</td>
                      <td className="text-center">{item.q1 || '-'}</td>
                      <td className="text-center">{item.q2 || '-'}</td>
                      <td className="text-center">{item.q3 || '-'}</td>
                      <td className="text-center">{item.q4 || '-'}</td>
                      <td className="text-center font-bold">{item.final || '-'}</td>
                      <td className="text-center">
                        {item.final >= 75 ? (
                          <span className="badge-success">Passed</span>
                        ) : item.final ? (
                          <span className="badge-danger">Failed</span>
                        ) : (
                          <span className="badge-warning">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No subjects available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

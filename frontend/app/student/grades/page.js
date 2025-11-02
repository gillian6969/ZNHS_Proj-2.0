'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { gradeAPI } from '@/utils/api';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';
import Loading from '@/components/Loading';

const studentMenu = [
  { label: 'Dashboard', href: '/student/dashboard', iconName: 'dashboard' },
  { label: 'Grades', href: '/student/grades', iconName: 'grades' },
  { label: 'Subjects', href: '/student/subjects', iconName: 'book' },
  { label: 'Attendance', href: '/student/attendance', iconName: 'calendar' },
  { label: 'Profile', href: '/student/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StudentGrades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
  }, [user]);

  const fetchGrades = async () => {
    try {
      const { data } = await gradeAPI.getAll({ studentId: user._id });
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + (grade.final || 0), 0);
    return (total / grades.length).toFixed(2);
  };

  const handleExportCSV = () => {
    const exportData = grades.map(grade => ({
      Subject: grade.subject,
      'Quarter 1': grade.q1 || '-',
      'Quarter 2': grade.q2 || '-',
      'Quarter 3': grade.q3 || '-',
      'Quarter 4': grade.q4 || '-',
      'Final Grade': grade.final || '-',
    }));
    exportToCSV(exportData, `grades-${user.name}`);
  };

  const handleExportPDF = () => {
    exportToPDF(grades, user.name, 'Grades Report');
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <ModernSidebar menuItems={studentMenu}>
        <div className="flex justify-between items-center mb-5">
          <h1>My Grades</h1>
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
          <>
            {/* Summary Card */}
            <div className="card mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">General Average</p>
                  <h2 className="text-3xl font-bold text-blue-600">{calculateAverage()}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Subjects</p>
                  <p className="text-2xl font-bold">{grades.length}</p>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
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
                  {grades.length > 0 ? (
                    grades.map((grade) => (
                      <tr key={grade._id}>
                        <td className="font-medium">{grade.subject}</td>
                        <td className="text-center">{grade.q1 || '-'}</td>
                        <td className="text-center">{grade.q2 || '-'}</td>
                        <td className="text-center">{grade.q3 || '-'}</td>
                        <td className="text-center">{grade.q4 || '-'}</td>
                        <td className="text-center font-bold">{grade.final || '-'}</td>
                        <td className="text-center">
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
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No grades available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

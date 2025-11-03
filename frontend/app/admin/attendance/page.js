'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
import { attendanceAPI } from '@/utils/api';
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

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, attendance]);

  const fetchAttendance = async () => {
    try {
      const { data } = await attendanceAPI.getAll();
      setAttendance(data);
      setFilteredAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setToast({ isOpen: true, message: 'Failed to fetch attendance', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendance];

    if (filters.grade) {
      filtered = filtered.filter(a => a.studentId?.gradeLevel === filters.grade);
    }

    if (filters.section) {
      filtered = filtered.filter(a => a.studentId?.section === filters.section);
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(a => new Date(a.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(a => new Date(a.date) <= new Date(filters.dateTo));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.studentId?.name?.toLowerCase().includes(searchLower) ||
        a.studentId?.idNumber?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAttendance(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({ grade: '', section: '', status: '', dateFrom: '', dateTo: '', search: '' });
  };

  // Group attendance by class (grade + section)
  const groupedByClass = filteredAttendance.reduce((acc, record) => {
    const gradeLevel = record.studentId?.gradeLevel || 'Unknown';
    const section = record.studentId?.section || 'Unknown';
    const key = `${gradeLevel}-${section}`;
    
    if (!acc[key]) {
      acc[key] = {
        gradeLevel,
        section,
        records: [],
      };
    }

    acc[key].records.push(record);
    return acc;
  }, {});

  // Calculate stats for each class
  const getClassStats = (records) => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, late, absent, excused, attendanceRate };
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ModernSidebar menuItems={adminMenu} pageTitle="View Attendance">
        {/* Filter Toggle Button */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Attendance by Class</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                <label className="input-label">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div>
                <label className="input-label">Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="input-field"
                />
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
              Object.entries(groupedByClass).map(([key, classData]) => {
                const stats = getClassStats(classData.records);
                return (
                  <div key={key} className="card">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {classData.gradeLevel} - {classData.section}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {stats.total} attendance records
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Attendance Rate</p>
                          <p className="text-lg font-bold text-green-600">{stats.attendanceRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Present</p>
                        <p className="text-lg font-bold text-green-700">{stats.present}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">Late</p>
                        <p className="text-lg font-bold text-yellow-700">{stats.late}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-gray-600 mb-1">Absent</p>
                        <p className="text-lg font-bold text-red-700">{stats.absent}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Excused</p>
                        <p className="text-lg font-bold text-blue-700">{stats.excused}</p>
                      </div>
                    </div>

                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Student Name</th>
                            <th>ID Number</th>
                            <th>Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classData.records.map((record) => (
                            <tr key={record._id}>
                              <td>
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="font-medium">{record.studentId?.name || 'N/A'}</td>
                              <td>{record.studentId?.idNumber || 'N/A'}</td>
                              <td>
                                {record.status === 'present' && (
                                  <span className="badge-success">Present</span>
                                )}
                                {record.status === 'late' && (
                                  <span className="badge-warning">Late</span>
                                )}
                                {record.status === 'absent' && (
                                  <span className="badge-danger">Absent</span>
                                )}
                                {record.status === 'excused' && (
                                  <span className="badge-info">Excused</span>
                                )}
                              </td>
                              <td className="text-sm text-gray-600">{record.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card text-center py-12">
                <Icon name="calendar" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No attendance records found</p>
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


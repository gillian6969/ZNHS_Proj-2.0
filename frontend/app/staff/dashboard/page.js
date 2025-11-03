'use client';

import { useEffect, useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { classAPI, announcementAPI, gradeAPI, attendanceAPI } from '@/utils/api';
import { AttendancePieChart, AttendanceTrendChart, GradesChart, ClassPerformanceChart, QuarterGradesChart } from '@/components/Charts';
import Loading from '@/components/Loading';
import { GRADE_LEVELS, SECTIONS } from '@/utils/constants';

const staffMenu = [
  { label: 'Dashboard', href: '/staff/dashboard', iconName: 'dashboard' },
  { label: 'Gradebook', href: '/staff/gradebook', iconName: 'grades' },
  { label: 'Attendance', href: '/staff/attendance', iconName: 'calendar' },
  { label: 'Materials', href: '/staff/materials', iconName: 'book' },
  { label: 'Announcements', href: '/staff/announcements', iconName: 'announcement' },
  { label: 'Profile', href: '/staff/profile', iconName: 'user' },
  { label: 'Log Out', action: 'logout', iconName: 'logout' },
];

export default function StaffDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceFilter, setAttendanceFilter] = useState('week'); // 'week', 'month'
  const [gradeLevelFilter, setGradeLevelFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [quarterFilter, setQuarterFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [classesRes, announcementsRes] = await Promise.all([
        classAPI.getAll(),
        announcementAPI.getAll(),
      ]);

      const teacherClasses = classesRes.data.filter(cls => {
        return cls.teachers?.some(
          t => t.teacherId && (t.teacherId._id === user?._id || t.teacherId.toString() === user?._id)
        );
      });

      setClasses(teacherClasses);
      setAnnouncements(announcementsRes.data.slice(0, 5));

      // Fetch grades for all students in teacher's classes
      const studentIds = [];
      teacherClasses.forEach(cls => {
        if (cls.students) {
          cls.students.forEach(student => {
            if (student._id) studentIds.push(student._id);
          });
        }
      });

      if (studentIds.length > 0) {
        // Get teacher's subjects
        const teacherSubjects = [];
        teacherClasses.forEach(cls => {
          const teacherAssignment = cls.teachers?.find(
            t => t.teacherId && (t.teacherId._id === user?._id || t.teacherId.toString() === user?._id)
          );
          if (teacherAssignment?.subject && !teacherSubjects.includes(teacherAssignment.subject)) {
            teacherSubjects.push(teacherAssignment.subject);
          }
        });

        // Fetch grades for teacher's subjects
        const gradePromises = teacherSubjects.map(subject =>
          gradeAPI.getAll({ subject })
        );
        const gradeResults = await Promise.all(gradePromises);
        const allGrades = gradeResults.flatMap(res => res.data);
        
        // Filter grades to only students in teacher's classes
        const filteredGrades = allGrades.filter(g => 
          studentIds.includes(g.studentId?._id || g.studentId)
        );
        setGrades(filteredGrades);
      }

      // Fetch attendance for teacher's classes (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      if (studentIds.length > 0) {
        const attendancePromises = studentIds.map(id =>
          attendanceAPI.getAll({ 
            studentId: id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        );
        const attendanceResults = await Promise.all(attendancePromises);
        const allAttendance = attendanceResults.flatMap(res => res.data || []);
        setAttendance(allAttendance);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

  // Get teacher's subjects
  const teacherSubjects = [];
  classes.forEach(cls => {
    const teacherAssignment = cls.teachers?.find(
      t => t.teacherId && (t.teacherId._id === user?._id || t.teacherId.toString() === user?._id)
    );
    if (teacherAssignment?.subject && !teacherSubjects.includes(teacherAssignment.subject)) {
      teacherSubjects.push(teacherAssignment.subject);
    }
  });

  // Apply all filters to grades
  const applyGradeSectionFilters = (gradesList) => {
    let filtered = [...gradesList];
    
    if (gradeLevelFilter !== 'all') {
      filtered = filtered.filter(g => 
        g.studentId?.gradeLevel === gradeLevelFilter
      );
    }
    
    if (sectionFilter !== 'all') {
      filtered = filtered.filter(g => 
        g.studentId?.section === sectionFilter
      );
    }
    
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(g => 
        g.subject === subjectFilter
      );
    }
    
    if (quarterFilter !== 'all') {
      filtered = filtered.filter(g => {
        const quarter = quarterFilter.toLowerCase();
        const quarterValue = g[quarter];
        return quarterValue && quarterValue > 0;
      });
    }
    
    return filtered;
  };

  // Prepare class performance chart data
  const prepareClassPerformanceData = () => {
    let filteredGrades = applyGradeSectionFilters(grades);

    // Group by grade level
    const gradeLevels = [...new Set(filteredGrades.map(g => g.studentId?.gradeLevel).filter(Boolean))].sort();
    const averages = gradeLevels.map(level => {
      const levelGrades = filteredGrades.filter(g => g.studentId?.gradeLevel === level);
      if (levelGrades.length === 0) return 0;
      
      let total = 0;
      let count = 0;
      
      levelGrades.forEach(g => {
        if (quarterFilter === 'all') {
          total += g.final || 0;
          if (g.final && g.final > 0) count++;
        } else {
          const quarter = quarterFilter.toLowerCase();
          const quarterValue = g[quarter];
          if (quarterValue && quarterValue > 0) {
            total += quarterValue;
            count++;
          }
        }
      });
      
      return count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
    });

    return {
      labels: gradeLevels,
      values: averages,
    };
  };

  // Prepare grades by subject chart data
  const prepareGradesBySubjectData = () => {
    let filteredGrades = applyGradeSectionFilters(grades);

    // If subject filter is not 'all', only show that subject
    // Otherwise show all subjects
    const subjects = subjectFilter !== 'all' 
      ? [subjectFilter]
      : [...new Set(filteredGrades.map(g => g.subject).filter(Boolean))].sort();
    
    const averages = subjects.map(subject => {
      const subjectGrades = filteredGrades.filter(g => g.subject === subject);
      if (subjectGrades.length === 0) return 0;
      
      let total = 0;
      let count = 0;
      
      subjectGrades.forEach(g => {
        if (quarterFilter === 'all') {
          total += g.final || 0;
          if (g.final && g.final > 0) count++;
        } else {
          const quarter = quarterFilter.toLowerCase();
          const quarterValue = g[quarter];
          if (quarterValue && quarterValue > 0) {
            total += quarterValue;
            count++;
          }
        }
      });
      
      return count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
    });

    return {
      labels: subjects,
      values: averages,
    };
  };

  // Prepare quarter grades comparison data (aggregate by subject)
  const prepareQuarterGradesData = () => {
    const filteredGrades = applyGradeSectionFilters(grades);
    
    // Group by subject and calculate averages for each quarter
    const subjectMap = {};
    
    filteredGrades.forEach(grade => {
      const subject = grade.subject;
      if (!subject) return;
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject: subject,
          q1: [],
          q2: [],
          q3: [],
          q4: [],
        };
      }
      
      if (grade.q1 && grade.q1 > 0) subjectMap[subject].q1.push(grade.q1);
      if (grade.q2 && grade.q2 > 0) subjectMap[subject].q2.push(grade.q2);
      if (grade.q3 && grade.q3 > 0) subjectMap[subject].q3.push(grade.q3);
      if (grade.q4 && grade.q4 > 0) subjectMap[subject].q4.push(grade.q4);
    });
    
    // Convert to array with averaged values
    const aggregatedData = Object.values(subjectMap).map(subj => ({
      subject: subj.subject,
      q1: subj.q1.length > 0 ? subj.q1.reduce((a, b) => a + b, 0) / subj.q1.length : 0,
      q2: subj.q2.length > 0 ? subj.q2.reduce((a, b) => a + b, 0) / subj.q2.length : 0,
      q3: subj.q3.length > 0 ? subj.q3.reduce((a, b) => a + b, 0) / subj.q3.length : 0,
      q4: subj.q4.length > 0 ? subj.q4.reduce((a, b) => a + b, 0) / subj.q4.length : 0,
    }));
    
    return aggregatedData;
  };

  // Prepare attendance chart data (with grade/section filter)
  const prepareAttendanceChartData = () => {
    const now = new Date();
    let startDate = new Date();
    
    if (attendanceFilter === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    let filteredAttendance = attendance.filter(a => {
      const recordDate = new Date(a.date);
      return recordDate >= startDate && recordDate <= now;
    });

    // Apply grade and section filters
    if (gradeLevelFilter !== 'all') {
      filteredAttendance = filteredAttendance.filter(a => 
        a.studentId?.gradeLevel === gradeLevelFilter
      );
    }
    
    if (sectionFilter !== 'all') {
      filteredAttendance = filteredAttendance.filter(a => 
        a.studentId?.section === sectionFilter
      );
    }

    // Calculate totals for pie chart
    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    filteredAttendance.forEach(a => {
      if (a.status === 'present') {
        totals.present++;
      } else if (a.status === 'absent') {
        totals.absent++;
      } else if (a.status === 'late') {
        totals.late++;
      } else if (a.status === 'excused') {
        totals.excused++;
      }
    });

    return totals;
  };

  // Get available grade levels from teacher's classes
  const getAvailableGradeLevels = () => {
    const gradeLevels = new Set();
    classes.forEach(cls => {
      if (cls.gradeLevel) {
        gradeLevels.add(cls.gradeLevel);
      }
      // Also check from students in the class
      if (cls.students) {
        cls.students.forEach(student => {
          if (student.gradeLevel) gradeLevels.add(student.gradeLevel);
        });
      }
    });
    const availableLevels = Array.from(gradeLevels).sort();
    // Return in GRADE_LEVELS order if they exist
    return GRADE_LEVELS.filter(level => availableLevels.includes(level));
  };

  // Get available sections from teacher's classes
  const getAvailableSections = () => {
    const sections = new Set();
    classes.forEach(cls => {
      if (cls.section) {
        sections.add(cls.section);
      }
      // Also check from students in the class
      if (cls.students) {
        cls.students.forEach(student => {
          if (student.section) sections.add(student.section);
        });
      }
    });
    return Array.from(sections).sort();
  };

  // Get available subjects from teacher's classes (teacher's subjects)
  const getAvailableSubjects = () => {
    return teacherSubjects.sort();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <ModernSidebar menuItems={staffMenu} pageTitle="Teacher Dashboard">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
          {/* School Logo Watermark */}
          <div className="absolute right-10 left-10 top-0 bottom-0 flex items-center justify-end opacity-[.50] pointer-events-none">
            <img 
              src="/znhslogo.png" 
              alt="ZNHS Logo" 
              className="w-[300%] h-[300%] object-contain translate-x-1/4 -rotate-12"
            />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Teacher'}! 👋
              </h1>
              <p className="text-purple-100 text-lg">
                Ready to inspire minds today?
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Students</p>
                    <h2 className="text-2xl font-bold text-blue-600">{totalStudents}</h2>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="users" className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">My Classes</p>
                    <h2 className="text-2xl font-bold text-green-600">{classes.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="class" className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <h2 className="text-lg font-bold text-purple-600">{user?.subject || 'N/A'}</h2>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="book" className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Announcements</p>
                    <h2 className="text-2xl font-bold text-orange-600">{announcements.length}</h2>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon name="announcement" className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Global Filters */}
            <div className="card mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-sm font-medium text-gray-700">Filters:</label>
                <select
                  value={gradeLevelFilter}
                  onChange={(e) => setGradeLevelFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Grade Levels</option>
                  {getAvailableGradeLevels().map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sections</option>
                  {getAvailableSections().map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {getAvailableSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <select
                  value={quarterFilter}
                  onChange={(e) => setQuarterFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Quarters</option>
                  <option value="q1">Q1</option>
                  <option value="q2">Q2</option>
                  <option value="q3">Q3</option>
                  <option value="q4">Q4</option>
                </select>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-5">
              <div className="card">
                <h3 className="mb-3">Performance by Grade Level</h3>
                {grades.length > 0 && prepareClassPerformanceData().values.some(v => v > 0) ? (
                  <ClassPerformanceChart data={prepareClassPerformanceData()} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No grades data available</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3">Average Grades by Subject</h3>
                {grades.length > 0 && prepareGradesBySubjectData().labels.length > 0 ? (
                  <GradesChart data={prepareGradesBySubjectData()} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No grades data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-5">
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Attendance Overview</h3>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                {attendance.length > 0 ? (
                  <AttendancePieChart data={prepareAttendanceChartData()} />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No attendance data available</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3">Quarter Grades Comparison</h3>
                {grades.length > 0 && prepareQuarterGradesData().length > 0 ? (
                  <QuarterGradesChart data={prepareQuarterGradesData()} />
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    <p>No grades data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* My Classes */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>My Classes</h3>
                  <a href="/staff/gradebook" className="text-xs text-blue-600 hover:text-blue-700">View Gradebook</a>
                </div>
                {classes.length > 0 ? (
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-semibold">{cls.className}</h4>
                          <p className="text-xs text-gray-600">Room: {cls.room || 'N/A'}</p>
                        </div>
                        <span className="badge-info">{cls.students?.length || 0} students</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No classes assigned yet</p>
                )}
              </div>

              {/* Recent Announcements */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3>Recent Announcements</h3>
                  <a href="/staff/announcements" className="text-xs text-blue-600 hover:text-blue-700">View All</a>
                </div>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement._id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <h4 className="text-sm font-semibold">{announcement.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{announcement.body}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent announcements</p>
                )}
              </div>
            </div>
          </>
        )}
      </ModernSidebar>
    </ProtectedRoute>
  );
}

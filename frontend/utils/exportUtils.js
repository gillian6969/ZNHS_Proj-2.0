import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export grades to PDF
export const exportGradesToPDF = (grades, studentName) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Grade Report', 14, 20);
  
  // Add student name
  doc.setFontSize(12);
  doc.text(`Student: ${studentName}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);
  
  // Create table
  const tableData = grades.map(grade => [
    grade.subject,
    grade.q1 || '-',
    grade.q2 || '-',
    grade.q3 || '-',
    grade.q4 || '-',
    grade.final || '-',
  ]);
  
  doc.autoTable({
    head: [['Subject', '1Q', '2Q', '3Q', '4Q', 'Final']],
    body: tableData,
    startY: 45,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  });
  
  // Save PDF
  doc.save(`${studentName}_grades.pdf`);
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    csv += values.join(',') + '\n';
  });
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Export attendance to PDF
export const exportAttendanceToPDF = (attendance, studentName, stats) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Attendance Report', 14, 20);
  
  // Add student info
  doc.setFontSize(12);
  doc.text(`Student: ${studentName}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);
  
  // Add statistics
  if (stats) {
    doc.text(`Total Days: ${stats.total}`, 14, 44);
    doc.text(`Present: ${stats.present}`, 14, 51);
    doc.text(`Absent: ${stats.absent}`, 14, 58);
    doc.text(`Attendance Rate: ${stats.attendanceRate}%`, 14, 65);
  }
  
  // Create table
  const tableData = attendance.map(record => [
    new Date(record.date).toLocaleDateString(),
    record.status,
    record.subject || 'N/A',
    record.remarks || '-',
  ]);
  
  doc.autoTable({
    head: [['Date', 'Status', 'Subject', 'Remarks']],
    body: tableData,
    startY: stats ? 75 : 45,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  });
  
  // Save PDF
  doc.save(`${studentName}_attendance.pdf`);
};

// Generic export to PDF function (wrapper for exportGradesToPDF)
export const exportToPDF = (grades, studentName, title = 'Grades Report') => {
  exportGradesToPDF(grades, studentName);
};


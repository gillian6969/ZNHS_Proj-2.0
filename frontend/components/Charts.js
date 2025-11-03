'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Attendance Chart (Line Chart)
export function AttendanceChart({ data }) {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: data?.values || [95, 98, 92, 97, 93],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(37, 99, 235)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          callback: (value) => value + '%',
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}

// Grades Chart (Bar Chart)
export function GradesChart({ data }) {
  const chartData = {
    labels: data?.labels || ['Filipino', 'English', 'Math', 'Science', 'A.P.', 'TLE', 'MAPEH'],
    datasets: [
      {
        label: 'Average Grade',
        data: data?.values || [88, 90, 85, 92, 87, 89, 91],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(251, 146, 60, 0.85)',
          'rgba(168, 85, 247, 0.85)',
          'rgba(236, 72, 153, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(34, 197, 94, 0.85)',
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Distribution Chart (Doughnut Chart)
export function DistributionChart({ data, title }) {
  const chartData = {
    labels: data?.labels || ['Passed', 'Failed', 'Pending'],
    datasets: [
      {
        data: data?.values || [75, 10, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(251, 146, 60, 0.85)',
        ],
        borderWidth: 4,
        borderColor: '#fff',
        hoverBorderWidth: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

// Class Performance Chart
export function ClassPerformanceChart({ data }) {
  const chartData = {
    labels: data?.labels || ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    datasets: [
      {
        label: 'Average Score',
        data: data?.values || [85, 88, 87, 90, 92, 89],
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Quarter Grades Comparison Chart (Line Chart)
export function QuarterGradesChart({ data, selectedSubjects }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  // Filter data by selected subjects if filter is applied
  const filteredData = selectedSubjects && selectedSubjects.length > 0
    ? data?.filter(d => selectedSubjects.includes(d.subject))
    : data;

  // Get unique subjects
  const uniqueSubjects = [...new Set(filteredData?.map(d => d.subject).filter(Boolean))];
  const subjects = uniqueSubjects.sort();
  
  const chartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: subjects.map((subject, index) => {
      // Find all records for this subject and aggregate if needed
      const subjectRecords = filteredData.filter(d => d.subject === subject);
      
      // If multiple records exist, calculate average (already aggregated in admin/teacher dashboards)
      // If single record, use its values directly
      const subjectData = subjectRecords.length === 1 
        ? subjectRecords[0]
        : subjectRecords[0]; // Admin/teacher already provides aggregated data
      
      const colors = [
        'rgba(59, 130, 246, 1)',   // Blue
        'rgba(16, 185, 129, 1)',   // Green
        'rgba(251, 146, 60, 1)',   // Orange
        'rgba(168, 85, 247, 1)',   // Purple
        'rgba(236, 72, 153, 1)',   // Pink
        'rgba(14, 165, 233, 1)',   // Cyan
        'rgba(34, 197, 94, 1)',    // Lime
        'rgba(239, 68, 68, 1)',    // Red
      ];
      
      return {
        label: subject,
        data: [
          subjectData?.q1 || 0,
          subjectData?.q2 || 0,
          subjectData?.q3 || 0,
          subjectData?.q4 || 0,
        ],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
        fill: false,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 11 },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y || 0}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}

// Attendance Pie Chart (All Users)
export function AttendancePieChart({ data }) {
  // Calculate totals from attendance data
  const present = data?.present || 0;
  const absent = data?.absent || 0;
  const late = data?.late || 0;
  const excused = data?.excused || 0;
  
  const total = present + absent + late + excused;
  
  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No attendance data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Present', 'Late', 'Absent', 'Excused'],
    datasets: [
      {
        data: [present, late, absent, excused],
        backgroundColor: [
          'rgba(34, 197, 94, 0.85)',    // Green for Present
          'rgba(251, 146, 60, 0.85)',   // Orange for Late
          'rgba(239, 68, 68, 0.85)',    // Red for Absent
          'rgba(59, 130, 246, 0.85)',   // Blue for Excused
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label} (${value} - ${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

// Attendance Trend Chart (Line Chart - kept for reference, but using pie chart now)
export function AttendanceTrendChart({ data }) {
  const chartData = {
    labels: data?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Present',
        data: data?.present || [95, 97, 94, 96],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
      },
      {
        label: 'Late',
        data: data?.late || [2, 1, 3, 2],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(251, 146, 60)',
      },
      {
        label: 'Absent',
        data: data?.absent || [5, 3, 6, 4],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
      },
      {
        label: 'Excused',
        data: data?.excused || [1, 0, 1, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}


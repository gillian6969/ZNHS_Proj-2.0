'use client';

export function BarChart({ data, height = '200px' }) {
  if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 w-24 truncate">{item.label}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
            <div
              className="bg-gradient-blue h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="text-white font-semibold text-sm">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data, size = 200 }) {
  if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  const colors = [
    '#0033cc',
    '#4da6ff',
    '#00c8ff',
    '#ffd700',
    '#ff6b6b',
    '#51cf66',
    '#ff8c00',
    '#9b59b6',
  ];

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          
          currentAngle += angle;
          
          const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[index % colors.length]}
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm text-gray-700">
              {item.label}: <span className="font-semibold">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, height = '200px' }) {
  if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0033cc" />
            <stop offset="100%" stopColor="#4da6ff" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={i * 50}
            x2="500"
            y2={i * 50}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Line path */}
        <polyline
          points={data.map((d, i) => {
            const x = (i / (data.length - 1)) * 500;
            const y = 200 - ((d.value - minValue) / range) * 180 - 10;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 500;
          const y = 200 - ((d.value - minValue) / range) * 180 - 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill="#0033cc"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-600">{item.label}</span>
        ))}
      </div>
    </div>
  );
}


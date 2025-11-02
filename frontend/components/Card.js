export default function Card({ title, value, icon, subtitle, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl text-primary-light">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}


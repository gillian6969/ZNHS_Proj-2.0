export default function Table({ headers, data, renderRow }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>{renderRow(item, index)}</tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


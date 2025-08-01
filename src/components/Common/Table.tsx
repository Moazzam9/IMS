import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index?: number) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  className?: string;
  emptyMessage?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, className = '', emptyMessage = 'No data available' }) => {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-nihal-blue sticky top-0 z-10">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-nihal-yellow uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={`${rowIndex}-${column.key}-${colIndex}`} className="px-6 py-4 text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-sm text-gray-500 text-center">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
import React from 'react';
import TableSkeleton from './TableSkeleton';

const Table = ({ columns, data, keyField = 'id', onRowClick, loading = false, rowCount = 5 }) => {
  if (loading) {
    return <TableSkeleton columnsCount={columns.length} rowCount={rowCount} />;
  }

  return (
    <div className="overflow-x-auto w-full no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={col.key || index} 
                className={`py-3 px-4 sm:py-4 sm:px-6 text-xs font-semibold text-gray-400 border-b border-gray-600 whitespace-nowrap ${col.headerClassName || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] !== undefined && row[keyField] !== null ? `${row[keyField]}-${rowIndex}` : rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-gray-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={col.key || colIndex} 
                    className={`py-3 px-4 sm:py-4 sm:px-6 border-b border-gray-600 whitespace-nowrap ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-400 font-medium">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

import React from 'react';

const TableSkeleton = ({ columnsCount = 6, rowCount = 5 }) => {
  return (
    <div className="overflow-x-auto w-full no-scrollbar">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr>
            {Array.from({ length: columnsCount }).map((_, colIndex) => (
              <th key={colIndex} className="py-4 px-6 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-50">
              {Array.from({ length: columnsCount }).map((_, colIndex) => (
                <td key={colIndex} className="py-4 px-6">
                  <div 
                    className={`h-4 bg-gray-100 rounded-md animate-pulse ${
                      colIndex === 0 ? 'w-16' : colIndex === 1 ? 'w-36' : 'w-24'
                    }`}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;

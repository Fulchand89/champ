import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'items'
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage, '...', totalPages];
  };

  return (
    <div className="p-3 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center text-sm text-gray-400">
      <p className="text-center sm:text-left">
        Showing {startItem} to {endItem} of {totalItems} {itemName}
      </p>
      <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer ${currentPage === page
                  ? 'text-white shadow-sm'
                  : 'border border-gray-600 text-gray-400 hover:bg-gray-800'
                }`}
              style={currentPage === page ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

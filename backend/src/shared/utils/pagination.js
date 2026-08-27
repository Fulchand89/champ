const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? parseInt(page) : 1;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

const getCursorPagingData = (items, limit) => {
  let nextCursor = null;
  const hasNextPage = items.length > limit;

  if (hasNextPage) {
    // Remove the extra item fetched just to check for a next page
    const nextItem = items.pop();
    nextCursor = items[items.length - 1].id;
  } else if (items.length > 0) {
    nextCursor = null; 
  }

  return {
    items,
    pagination: {
      nextCursor,
      hasNextPage,
      itemsPerPage: limit,
    },
  };
};

module.exports = {
  getPagination,
  getPagingData,
  getCursorPagingData,
};
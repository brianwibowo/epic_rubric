import React, { useState } from 'react';
import styles from './DataTable.module.css';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from './Spinner';

const DataTable = ({
  columns = [], // [{key, label, sortable, render}]
  data = [],
  isLoading = false,
  pagination = false,
  pageSize = 10,
  emptyState,
  onRowClick
}) => {
  const [sortConfig, setSortConfig] = useState(null); // {key, direction}
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort logic
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Fallback for sub-objects/render functions
      if (typeof aVal === 'object') aVal = '';
      if (typeof bVal === 'object') bVal = '';

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.responsiveContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`
                    ${styles.th}
                    ${col.sortable ? styles.sortableTh : ''}
                  `}
                >
                  <div className={styles.thContent}>
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`loader-${i}`} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={`loader-cell-${col.key}`} className={styles.td}>
                      <div className={`${styles.skeletonCell} shimmer-bg`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyTd}>
                  {emptyState || (
                    <div className={styles.defaultEmpty}>Tidak ada data yang tersedia</div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    ${styles.tr}
                    ${onRowClick ? styles.clickableTr : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;

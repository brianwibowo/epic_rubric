import React from 'react';
import styles from './Pagination.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination component
 * Props:
 * - currentPage: number (1-indexed)
 * - totalPages: number
 * - totalItems: number
 * - itemsPerPage: number
 * - onPageChange: (page) => void
 * - onItemsPerPageChange: (itemsPerPage) => void (optional)
 * - pageSizeOptions: array [10, 25, 50]
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50],
  className = ''
}) => {
  if (totalPages <= 1 && totalItems <= itemsPerPage && !onItemsPerPageChange) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Left Info / Items Per Page */}
      <div className={styles.leftInfo}>
        <span className={styles.rangeText}>
          Menampilkan <strong>{startItem}-{endItem}</strong> dari <strong>{totalItems}</strong> data
        </span>
        {onItemsPerPageChange && (
          <div className={styles.sizeSelectorWrap}>
            <label htmlFor="pageSizeSelect" className={styles.sizeLabel}>Tampilkan:</label>
            <select
              id="pageSizeSelect"
              className={styles.sizeSelect}
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className={styles.controls}>
        <button
          className={styles.navBtn}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        <span className={styles.pageCounter}>
          Halaman <strong>{currentPage}</strong> dari <strong>{Math.max(1, totalPages)}</strong>
        </span>

        <button
          className={styles.navBtn}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

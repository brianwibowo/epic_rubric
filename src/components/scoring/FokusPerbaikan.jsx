import React from 'react';
import { EPIC_DIMENSIONS } from '@/utils/constants';
import styles from './FokusPerbaikan.module.css';
import Badge from '../ui/Badge';
import { AlertCircle } from 'lucide-react';

const FokusPerbaikan = ({ focusAreaCode }) => {
  if (!focusAreaCode || !EPIC_DIMENSIONS[focusAreaCode]) {
    return null;
  }

  const dimension = EPIC_DIMENSIONS[focusAreaCode];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Fokus Perbaikan Utama</h4>
      
      <div className={styles.card} style={{ '--dim-color': dimension.color }}>
        <div className={styles.iconWrapper}>
          <AlertCircle size={20} className={styles.icon} />
        </div>
        
        <div className={styles.content}>
          <div className={styles.badgeRow}>
            <Badge variant={focusAreaCode.toLowerCase()} size="sm" glow>
              {dimension.code}
            </Badge>
            <span className={styles.dimName}>{dimension.label}</span>
          </div>
          <p className={styles.desc}>
            Aspek ini diidentifikasi sebagai kompetensi terlemah siswa dalam tugas ini. Guru menyarankan untuk fokus mendalami pemecahan masalah pada bagian: <em>{dimension.desc}</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FokusPerbaikan;

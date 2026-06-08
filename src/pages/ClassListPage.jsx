import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChevronRight, Users, Calendar, ArrowRight } from 'lucide-react';
import styles from './ClassListPage.module.css';

const ClassListPage = () => {
  const navigate = useNavigate();
  
  const classes = [
    { id: 'XII-AKL-1', name: 'XII AKL 1', count: '36 Siswa', year: '2025/2026', teacher: 'Dra. Sri Wahyuni' },
    { id: 'XII-AKL-2', name: 'XII AKL 2', count: '34 Siswa', year: '2025/2026', teacher: 'Dra. Sri Wahyuni' },
    { id: 'XI-AKL-1', name: 'XI AKL 1', count: '38 Siswa', year: '2025/2026', teacher: 'Budi Santoso, M.Pd.' },
    { id: 'XI-AKL-2', name: 'XI AKL 2', count: '36 Siswa', year: '2025/2026', teacher: 'Budi Santoso, M.Pd.' }
  ];

  const handleOpenClass = (id) => {
    navigate(`/students/${id}`);
  };

  return (
    <div className={styles.container}>
      <Header title="Penilaian Praktikum Kelas" />
      
      <div className={styles.content}>
        <div className={styles.welcomeInfo}>
          <h2 className={styles.sectionTitle}>Pilih Kelas Akuntansi</h2>
          <p className={styles.sectionDesc}>
            Pilih rombongan belajar di bawah untuk melakukan input skor praktikum siswa, memfinalisasi draf, atau mempublikasikan rapor evaluasi.
          </p>
        </div>

        <div className={styles.grid}>
          {classes.map((cls) => (
            <Card 
              key={cls.id} 
              variant="glass" 
              hoverable 
              padding="lg" 
              onClick={() => handleOpenClass(cls.id)}
              className={styles.classCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconCircle}>
                  <Users size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <Badge variant="primary" size="sm" glow>
                  {cls.year}
                </Badge>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.className}>{cls.name}</h3>
                <p className={styles.teacherName}>Guru: {cls.teacher}</p>
                
                <div className={styles.metaRow}>
                  <span className={styles.countText}>{cls.count} terdaftar</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.actionLink}>Buka Roster Siswa</span>
                <ArrowRight size={16} className={styles.arrow} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassListPage;

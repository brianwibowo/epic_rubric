import React from 'react';
import Card from '../ui/Card';
import styles from './MacroStats.module.css';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2 
} from 'lucide-react';

const MacroStats = ({ stats = { avg: 0, max: 0, min: 0, passingRate: 0, total: 0 } }) => {
  const items = [
    {
      label: 'Rata-Rata Nilai',
      value: stats.avg !== null && stats.avg !== undefined ? stats.avg : '-',
      icon: <TrendingUp size={20} className={styles.iconBlue} />,
      desc: 'Rata-rata kumulatif kelas'
    },
    {
      label: 'Nilai Tertinggi',
      value: stats.max !== null && stats.max !== undefined ? stats.max : '-',
      icon: <ArrowUpRight size={20} className={styles.iconGreen} />,
      desc: 'Capaian terbaik siswa'
    },
    {
      label: 'Nilai Terendah',
      value: stats.min !== null && stats.min !== undefined ? stats.min : '-',
      icon: <ArrowDownRight size={20} className={styles.iconRed} />,
      desc: 'Batas bawah penilaian'
    },
    {
      label: 'Kelulusan KKM',
      value: stats.passingRate !== null && stats.passingRate !== undefined ? `${stats.passingRate}%` : '-',
      icon: <CheckCircle2 size={20} className={styles.iconTeal} />,
      desc: `KKM Acuan: 75`
    }
  ];

  return (
    <div className={styles.grid}>
      {items.map((item, idx) => (
        <Card key={idx} variant="glass" padding="md" className={styles.statCard}>
          <div className={styles.header}>
            <span className={styles.label}>{item.label}</span>
            <div className={styles.iconCircle}>{item.icon}</div>
          </div>
          <div className={styles.valueRow}>
            <h3 className={styles.value}>{item.value}</h3>
          </div>
          <p className={styles.desc}>{item.desc}</p>
        </Card>
      ))}
    </div>
  );
};

export default MacroStats;

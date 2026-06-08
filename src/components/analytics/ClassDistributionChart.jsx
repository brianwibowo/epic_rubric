import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import Card from '../ui/Card';
import styles from './ClassDistributionChart.module.css';

// Gradient configs
const COLORS = {
  remedial: 'url(#remedialGrad)',
  kompeten: 'url(#kompetenGrad)',
  sangatBaik: 'url(#sangatBaikGrad)'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{payload[0].name}</p>
        <p className={styles.tooltipVal}>
          <strong>{payload[0].value} Siswa</strong>
        </p>
      </div>
    );
  }
  return null;
};

const ClassDistributionChart = ({ data = [] }) => {
  return (
    <Card variant="glass" padding="md" className={styles.card}>
      <h4 className={styles.title}>Distribusi Nilai Siswa</h4>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="remedialGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#991B1B" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="kompetenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="sangatBaikGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#065F46" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            
            <YAxis 
              allowDecimals={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
            
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => {
                let fill = COLORS.kompeten;
                if (entry.name.includes('<75')) fill = COLORS.remedial;
                if (entry.name.includes('≥85')) fill = COLORS.sangatBaik;
                
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ClassDistributionChart;

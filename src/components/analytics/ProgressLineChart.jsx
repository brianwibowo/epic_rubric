import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Card from '../ui/Card';
import styles from './ProgressLineChart.module.css';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipProject}>{data.name}</p>
        
        <div className={styles.tooltipHeader}>
          <span className={styles.scoreLabel}>Nilai Akhir:</span>
          <span className={styles.scoreVal}>{data.score}</span>
        </div>
        
        <div className={styles.dimensionsGrid}>
          <div className={styles.dimItem}>
            <span className={styles.dimCode} style={{ color: 'var(--color-epic-e)' }}>E</span>
            <span>{data.E}/4</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimCode} style={{ color: 'var(--color-epic-p)' }}>P</span>
            <span>{data.P}/4</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimCode} style={{ color: 'var(--color-epic-i)' }}>I</span>
            <span>{data.I}/4</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimCode} style={{ color: 'var(--color-epic-c)' }}>C</span>
            <span>{data.C}/4</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimCode} style={{ color: 'var(--color-epic-pe)' }}>PE</span>
            <span>{data.PE}/4</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ProgressLineChart = ({ data = [], studentName = 'Siswa' }) => {
  return (
    <Card variant="glass" padding="md" className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>Perkembangan Nilai Kronologis</h4>
        <span className={styles.studentName}>{studentName}</span>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />

            {/* Reference Line for standard KKM 75 */}
            <ReferenceLine 
              y={75} 
              stroke="rgba(239, 68, 68, 0.4)" 
              strokeDasharray="4 4"
              label={{ 
                value: 'KKM: 75', 
                position: 'insideBottomRight', 
                fill: 'var(--color-error)', 
                fontSize: 10, 
                fontWeight: 600 
              }} 
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#FFF', stroke: 'var(--color-primary)', strokeWidth: 2 }}
              activeDot={{ r: 8, stroke: 'var(--color-primary)', strokeWidth: 2, fill: '#FFF' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProgressLineChart;

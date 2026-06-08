import React, { useState, useEffect } from 'react';
import { EPIC_DIMENSIONS } from '@/utils/constants';
import { validateWeightsSum } from '@/utils/validators';
import DimensionWeightSlider from './DimensionWeightSlider';
import styles from './RubricConfigurator.module.css';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import Badge from '../ui/Badge';
import { Info, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const RubricConfigurator = ({
  initialWeights = { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 },
  initialName = '',
  initialIsMaster = false,
  onSave,
  isLoading = false
}) => {
  const [weights, setWeights] = useState(initialWeights);
  const [templateName, setTemplateName] = useState(initialName);
  const [isMaster, setIsMaster] = useState(initialIsMaster);
  const [totalPercent, setTotalPercent] = useState(100);
  const [isValid, setIsValid] = useState(true);

  // Update total percent on weights change
  useEffect(() => {
    const sum = Object.keys(weights).reduce((acc, dim) => {
      const percentage = Math.round(weights[dim] * 100);
      return acc + percentage;
    }, 0);
    setTotalPercent(sum);
    setIsValid(sum === 100);
  }, [weights]);

  const handleWeightChange = (dim, value) => {
    setWeights((prev) => ({
      ...prev,
      [dim]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isValid) return;
    if (!templateName.trim()) {
      alert('Nama templat wajib diisi!');
      return;
    }
    onSave(templateName, weights, isMaster);
  };

  return (
    <Card variant="glass" padding="lg" className={styles.card}>
      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>Konfigurasi Pembobotan Rubrik</h3>
            <p className={styles.desc}>
              Tentukan porsi penilaian masing-masing aspek kompetensi akuntansi. Penjumlahan kelima bobot harus tepat 100%.
            </p>
          </div>
          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total Bobot</span>
            <div className={`${styles.totalBadge} ${isValid ? styles.valid : styles.invalid}`}>
              {isValid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{totalPercent}%</span>
            </div>
          </div>
        </div>

        {/* Input Template Name */}
        <div className={styles.metaFields}>
          <Input
            label="Nama Master Templat Rubrik"
            type="text"
            placeholder="Contoh: Rubrik Ujian Praktikum Jurnal Penyesuaian"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
            disabled={isLoading}
            className={styles.nameInput}
          />
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isMaster}
              onChange={(e) => setIsMaster(e.target.checked)}
              disabled={isLoading}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Jadikan sebagai templat utama (*Master Template* otomatis)
            </span>
          </label>
        </div>

        {/* Sliders Grid */}
        <div className={styles.slidersList}>
          {Object.keys(EPIC_DIMENSIONS).map((key) => (
            <DimensionWeightSlider
              key={key}
              dimension={EPIC_DIMENSIONS[key]}
              value={weights[key]}
              onChange={(val) => handleWeightChange(key, val)}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Save Actions Bar */}
        <div className={styles.actionBar}>
          <div className={styles.infoBox}>
            <Info size={16} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Saat ini menggunakan pembobotan berbasis desimal presisi tinggi pada server backend.
            </p>
          </div>

          <Tooltip
            content="Total penjumlahan bobot harus tepat 100% sebelum Anda dapat menyimpan templat ini."
            position="top"
            disabled={isValid}
          >
            <Button
              type="submit"
              variant={isValid ? 'epic' : 'secondary'}
              disabled={!isValid || !templateName.trim() || isLoading}
              isLoading={isLoading}
              iconLeft={<Save size={18} />}
            >
              Simpan Konfigurasi
            </Button>
          </Tooltip>
        </div>
      </form>
    </Card>
  );
};

export default RubricConfigurator;

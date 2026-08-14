import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './CreateMKPage.module.css';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import Modal from '@/components/ui/Modal';
import HelpButton from '@/components/ui/HelpButton';
import { capitalizeWords, capitalizeFirstLetter } from '@/utils/formatters';
import { ArrowLeft, BookOpen, PlusCircle, Sparkles, X, Check, Eye, CheckCircle2 } from 'lucide-react';

const SEMESTER_OPTIONS = [
  'Ganjil 2026/2027',
  'Genap 2026/2027',
  'Ganjil 2025/2026',
  'Genap 2025/2026',
];

const DEFAULT_KOMPONEN_CONFIG = [
  { id: 'default-0', name: 'Proyek', bobot: 25, rubricId: 'r1', enabled: true },
  { id: 'default-1', name: 'Partisipasi Kelas', bobot: 10, rubricId: 'r2', enabled: true },
  { id: 'default-2', name: 'Quiz', bobot: 15, rubricId: 'r2', enabled: true },
  { id: 'default-3', name: 'Tugas', bobot: 15, rubricId: 'r1', enabled: true },
  { id: 'default-4', name: 'UTS', bobot: 15, rubricId: 'r3', enabled: true },
  { id: 'default-5', name: 'UAS', bobot: 20, rubricId: 'r3', enabled: true },
];

const CreateMKPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { createMK } = useMKStore();
  const { rubrics } = useRubricStore();
  const { addToast } = useUiStore();
  const { courseLabel, courseCodeLabel, rombelLabel, isSchool } = useTerminology();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    kode_mk: '',
    semester: SEMESTER_OPTIONS[0],
    kode_semester: '',
    sks: 2,
    kelas: '',
    description: '',
  });
  const [komponenList, setKomponenList] = useState(DEFAULT_KOMPONEN_CONFIG);
  const [newKomponen, setNewKomponen] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRubric, setPreviewRubric] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleKomponen = (id) => {
    setKomponenList(prev => prev.map(k => k.id === id ? { ...k, enabled: !k.enabled } : k));
  };

  const updateKomponenField = (id, field, value) => {
    setKomponenList(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const removeKomponen = (id) => {
    setKomponenList(prev => prev.filter(k => k.id !== id));
  };

  const addKomponen = () => {
    if (!newKomponen.trim()) return;
    setKomponenList(prev => [
      ...prev, 
      { id: `custom-${Date.now()}`, name: newKomponen.trim(), bobot: 0, rubricId: rubrics[0]?.id || 'r1', enabled: true }
    ]);
    setNewKomponen('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const enabledKomponen = komponenList
      .filter(k => k.enabled)
      .map((k, idx) => {
        const assigned = rubrics.find(r => r.id === k.rubricId);
        return {
          id: `k-${Date.now()}-${idx}`,
          name: k.name,
          bobot: (parseFloat(k.bobot) || 0) / 100,
          rubricId: k.rubricId || null,
          rubricName: assigned?.name || null,
          urutan: idx + 1
        };
      });

    const newMK = createMK(
      {
        ...formData,
        dosen_id: profile?.id,
        dosen_name: profile?.full_name
      },
      enabledKomponen
    );

    setIsSubmitting(false);
    addToast(`${courseLabel} "${newMK.name}" berhasil dibuat!`, 'success');
    navigate(`/mk/${newMK.id}`);
  };

  const isStep1Valid = formData.name.trim() && formData.kode_mk.trim() && formData.semester && Number(formData.sks) > 0;
  const enabledKomponen = komponenList.filter(k => k.enabled);

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(isSchool ? '/kelas' : '/mk')}>
        <ArrowLeft size={16} /> Kembali ke {isSchool ? 'Daftar Kelas' : 'Daftar MK'}
      </button>

      <div className={styles.headerSection}>
        <div className={styles.headerIcon}>
          <BookOpen size={28} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <h1 className={styles.title}>Buat {courseLabel} Baru</h1>
          <HelpButton size={22} />
        </div>
        <p className={styles.subtitle}>Isi informasi dasar {courseLabel.toLowerCase()}, lalu konfigurasi komponen penilaian</p>
      </div>

      {/* Step Indicator */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
          <div className={styles.stepDot}>{step > 1 ? <Check size={14} /> : '1'}</div>
          <span>Informasi {courseLabel}</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepDot}>2</div>
          <span>Komponen Penilaian</span>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card variant="glass" padding="lg" className={styles.formCard}>
          <div className={styles.formGrid}>
            <Input
              label={`Nama ${courseLabel}`}
              placeholder={isSchool ? "e.g. Praktikum Akuntansi Lembaga" : "e.g. Praktikum Akuntansi Dasar"}
              value={formData.name}
              onChange={(e) => updateField('name', capitalizeWords(e.target.value))}
              required
            />
            <Input
              label={courseCodeLabel}
              placeholder={isSchool ? "e.g. AKL-01" : "e.g. 25P04085"}
              value={formData.kode_mk}
              onChange={(e) => updateField('kode_mk', e.target.value.toUpperCase())}
              required
            />
            <div className={styles.selectWrap}>
              <label className={styles.selectLabel}>Semester</label>
              <select 
                className={styles.select}
                value={formData.semester}
                onChange={(e) => updateField('semester', e.target.value)}
              >
                {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input
              label={<>Kode Semester <span className={styles.optional}>(opsional)</span></>}
              placeholder="e.g. R225"
              value={formData.kode_semester}
              onChange={(e) => updateField('kode_semester', e.target.value.toUpperCase())}
            />
            <Input
              label="SKS / Beban Jam"
              type="number"
              placeholder="2"
              value={formData.sks}
              onChange={(e) => updateField('sks', Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
              required
            />
            <Input
              label={<>Nama {rombelLabel} Awal <span className={styles.optional}>(opsional)</span></>}
              placeholder={isSchool ? "e.g. XII AKL 1" : "e.g. PE 2025 A"}
              value={formData.kelas}
              onChange={(e) => updateField('kelas', capitalizeWords(e.target.value))}
            />
            <div className={styles.textareaWrap}>
              <label className={styles.selectLabel}>Deskripsi <span className={styles.optional}>(opsional)</span></label>
              <textarea
                className={styles.textarea}
                placeholder={`Deskripsi singkat ${courseLabel.toLowerCase()}...`}
                value={formData.description}
                onChange={(e) => updateField('description', capitalizeFirstLetter(e.target.value))}
                rows={3}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button variant="outline" onClick={() => navigate(isSchool ? '/kelas' : '/mk')}>Batal</Button>
            <Button variant="primary" disabled={!isStep1Valid} onClick={() => setStep(2)}>
              Lanjut ke Komponen
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Komponen */}
      {step === 2 && (
        <Card variant="glass" padding="lg" className={styles.formCard}>
          <div className={styles.komponenHeader}>
            <h3 className={styles.komponenTitle}>Konfigurasi Komponen Penilaian & Rubrik</h3>
            <p className={styles.komponenHint}>
              <Sparkles size={14} /> 
              Pilih template rubrik dan tentukan bobot untuk tiap komponen. Jika total bobot = 100% dan semua komponen memiliki rubrik, MK akan <strong>Otomatis Aktif!</strong>
            </p>
          </div>

          <div className={styles.komponenList} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {komponenList.map((k) => {
              const selectedRubric = rubrics.find(r => r.id === k.rubricId);
              return (
                <div 
                  key={k.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: k.enabled ? 'var(--bg-card)' : 'var(--bg-app)',
                    opacity: k.enabled ? 1 : 0.6,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                    <button 
                      className={`${styles.toggleBtn} ${k.enabled ? styles.on : styles.off}`}
                      onClick={() => toggleKomponen(k.id)}
                      title={k.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {k.enabled ? <Check size={14} /> : <X size={14} />}
                    </button>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{k.name}</span>
                  </div>

                  {k.enabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Bobot % Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bobot:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={k.bobot}
                          onChange={(e) => updateKomponenField(k.id, 'bobot', e.target.value)}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 600
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>%</span>
                      </div>

                      {/* Rubrik Dropdown Select */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select
                          value={k.rubricId || ''}
                          onChange={(e) => updateKomponenField(k.id, 'rubricId', e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '13px',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            maxWidth: '200px'
                          }}
                        >
                          <option value="">-- Pilih Template Rubrik --</option>
                          {rubrics.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>

                        {/* View Rubric Content Eye Icon Button */}
                        {selectedRubric && (
                          <button
                            type="button"
                            onClick={() => setPreviewRubric(selectedRubric)}
                            title="Lihat Isi Rubrik"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-app)',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <Eye size={14} /> Lihat Rubrik
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {k.id.startsWith('custom-') && (
                    <button className={styles.removeBtn} onClick={() => removeKomponen(k.id)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add custom komponen */}
          <div className={styles.addKomponenRow} style={{ marginTop: '16px' }}>
            <input
              className={styles.addInput}
              placeholder="Tambah komponen custom..."
              value={newKomponen}
              onChange={(e) => setNewKomponen(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKomponen()}
            />
            <Button variant="outline" size="sm" onClick={addKomponen} disabled={!newKomponen.trim()}>
              <PlusCircle size={14} /> Tambah
            </Button>
          </div>

          {/* Summary Box */}
          {(() => {
            const totalBobot = enabledKomponen.reduce((sum, k) => sum + (parseFloat(k.bobot) || 0), 0);
            const allHasRubric = enabledKomponen.length > 0 && enabledKomponen.every(k => k.rubricId);
            const isValid = Math.abs(totalBobot - 100) < 0.1 && allHasRubric;

            return (
              <div 
                style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: isValid ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                  border: `1px solid ${isValid ? 'var(--color-success)' : 'var(--color-warning)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong style={{ color: isValid ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    Total Bobot: {totalBobot}% {isValid ? '✓ (Pas 100%)' : '(Belum 100%)'}
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {isValid 
                      ? '🎉 Semua komponen & rubrik lengkap! MK akan Otomatis AKTIF.' 
                      : 'Pastikan total bobot 100% dan semua komponen memiliki template rubrik.'}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className={styles.formActions} style={{ marginTop: '24px' }}>
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Kembali
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              disabled={enabledKomponen.length === 0}
            >
              <BookOpen size={16} /> Buat Mata Kuliah
            </Button>
          </div>
        </Card>
      )}

      {/* Rubric Preview Modal */}
      {previewRubric && (
        <Modal
          isOpen={!!previewRubric}
          onClose={() => setPreviewRubric(null)}
          title={`Detail Template Rubrik: ${previewRubric.name}`}
          size="md"
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              {previewRubric.description || 'Tidak ada deskripsi.'}
            </p>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Dimensi EPIC ({previewRubric.dimensions?.length || 0} Dimensi):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(previewRubric.dimensions || []).map((dim, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-primary)' }}>[{dim.code}] {dim.name}</span>
                    <span>Bobot: {(dim.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Likert 4: {dim.feedback_4 || '-'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="primary" size="sm" onClick={() => setPreviewRubric(null)}>
                Tutup Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateMKPage;

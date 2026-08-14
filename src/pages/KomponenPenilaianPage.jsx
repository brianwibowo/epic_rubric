import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { validateWeightsSum } from '@/utils/scoringEngine';
import { capitalizeWords } from '@/utils/formatters';
import { getKomponenCode, getKomponenFullName } from '@/utils/komponenHelper';
import styles from './KomponenPenilaianPage.module.css';
import { 
  PlusCircle, Trash2, Edit2, Link2, CheckCircle2, 
  AlertTriangle, ArrowLeft, ArrowUp, ArrowDown, Eye,
  Layers, Check, Sparkles, Scale, Info
} from 'lucide-react';
import HelpButton from '@/components/ui/HelpButton';

const COMPONENT_COLORS = ['#2563eb', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

const NAME_PRESETS = [
  'Hasil Proyek',
  'Aktivitas Partisipatif',
  'Tugas Praktikum',
  'Kuis',
  'Ujian Tengah Semester',
  'Ujian Akhir Semester'
];

const BOBOT_PRESETS = [10, 15, 20, 25, 30];

const KomponenPenilaianPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { mkList, updateKomponenList, assignRubricToKomponen } = useMKStore();
  const { rubrics } = useRubricStore();
  const { addToast } = useUiStore();
  const { courseLabel } = useTerminology();

  const mk = mkList.find(m => m.id === mkId);
  const [komponen, setKomponen] = useState(mk?.komponen || []);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewRubric, setPreviewRubric] = useState(null);

  // Add Form State
  const [addForm, setAddForm] = useState({
    name: '',
    bobotPct: 20,
    rubricId: ''
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    bobotPct: 0,
    rubricId: ''
  });

  useEffect(() => {
    if (mk?.komponen) {
      setKomponen(mk.komponen);
    }
  }, [mk]);

  // Weight Calculation & Validation
  const weights = komponen.map(k => Number(k.bobot) || 0);
  const weightValidation = validateWeightsSum(weights);
  const totalPercent = Math.round(weightValidation.total * 100);
  const allHaveRubric = komponen.length > 0 && komponen.every(k => k.rubricId);
  const isReadyToActivate = weightValidation.valid && allHaveRubric;

  // --- Handlers ---

  const handleOpenAddModal = () => {
    // Pick first available rubric as default if exists
    const defaultRubric = rubrics[0]?.id || '';
    setAddForm({
      name: '',
      bobotPct: 20,
      rubricId: defaultRubric
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = (e) => {
    if (e) e.preventDefault();
    if (!addForm.name.trim()) {
      addToast('Nama komponen tidak boleh kosong', 'warning');
      return;
    }

    const selectedRubric = rubrics.find(r => r.id === addForm.rubricId);
    const newBobot = (parseFloat(addForm.bobotPct) || 0) / 100;

    const newComponent = {
      id: `k-${Date.now()}`,
      name: addForm.name.trim(),
      bobot: newBobot,
      rubricId: selectedRubric ? selectedRubric.id : null,
      rubricName: selectedRubric ? selectedRubric.name : null,
      urutan: komponen.length + 1
    };

    const updated = [...komponen, newComponent];
    setKomponen(updated);
    updateKomponenList(mkId, updated);
    setShowAddModal(false);
    addToast(`Komponen "${newComponent.name}" berhasil ditambahkan`, 'success');
  };

  const handleOpenEditModal = (k) => {
    setEditForm({
      id: k.id,
      name: k.name,
      bobotPct: Math.round((Number(k.bobot) || 0) * 100),
      rubricId: k.rubricId || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!editForm.name.trim()) {
      addToast('Nama komponen tidak boleh kosong', 'warning');
      return;
    }

    const selectedRubric = rubrics.find(r => r.id === editForm.rubricId);
    const newBobot = (parseFloat(editForm.bobotPct) || 0) / 100;

    const updated = komponen.map(k => {
      if (k.id === editForm.id) {
        return {
          ...k,
          name: editForm.name.trim(),
          bobot: newBobot,
          rubricId: selectedRubric ? selectedRubric.id : null,
          rubricName: selectedRubric ? selectedRubric.name : null
        };
      }
      return k;
    });

    setKomponen(updated);
    updateKomponenList(mkId, updated);
    setShowEditModal(false);
    addToast(`Komponen "${editForm.name}" berhasil diperbarui`, 'success');
  };

  const handleDirectRubricChange = (komponenId, newRubricId) => {
    const selectedRubric = rubrics.find(r => r.id === newRubricId);
    const rubricName = selectedRubric ? selectedRubric.name : null;

    assignRubricToKomponen(mkId, komponenId, newRubricId || null, rubricName);

    const updated = komponen.map(k => {
      if (k.id === komponenId) {
        return {
          ...k,
          rubricId: newRubricId || null,
          rubricName
        };
      }
      return k;
    });

    setKomponen(updated);
    if (selectedRubric) {
      addToast(`Rubrik "${selectedRubric.name}" berhasil ditautkan`, 'success');
    } else {
      addToast('Tautan rubrik dilepas', 'info');
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus komponen penilaian "${name}"?`)) {
      const updated = komponen.filter(k => k.id !== id).map((k, idx) => ({ ...k, urutan: idx + 1 }));
      setKomponen(updated);
      updateKomponenList(mkId, updated);
      addToast(`Komponen "${name}" berhasil dihapus`, 'info');
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= komponen.length) return;

    const updated = [...komponen];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((k, idx) => ({ ...k, urutan: idx + 1 }));
    setKomponen(reordered);
    updateKomponenList(mkId, reordered);
  };

  if (!mk) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/mk')}>
            Kembali ke Daftar Mata Kuliah
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 1. HEADER WITH BREADCRUMB */}
      <div>
        <div className={styles.headerNavRow}>
          <button className={styles.backBtn} onClick={() => navigate(`/mk/${mkId}`)}>
            <ArrowLeft size={14} /> Kembali ke Ringkasan {mk.name}
          </button>
        </div>

        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Komponen & Rubrik Penilaian</h1>
              <HelpButton size={22} />
            </div>
            <p className={styles.subtitle}>
              Konfigurasi instrumen evaluasi, proporsi bobot (total 100%), dan tautan rubrik analitik EPIC untuk <strong>{mk.name}</strong>.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAddModal}>
            <PlusCircle size={16} /> Tambah Komponen
          </Button>
        </div>
      </div>

      {/* 2. WEIGHT SUMMARY & READINESS TRACKER */}
      <div className={styles.weightSummaryCard}>
        <div className={styles.weightHeaderRow}>
          <div className={styles.weightTitleWrap}>
            <Scale size={20} style={{ color: '#2563eb' }} />
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Distribusi Bobot Penilaian
              </span>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {komponen.length} Komponen Terdaftar • Standar Total Bobot 100%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span 
              className={`${styles.weightStatNumber} ${weightValidation.valid ? styles.valid : weightValidation.total > 1 ? styles.over : styles.invalid}`}
            >
              {totalPercent}%
            </span>
            {weightValidation.valid ? (
              <Badge variant="success" size="sm">
                <CheckCircle2 size={12} /> Tepat 100% (Valid)
              </Badge>
            ) : weightValidation.total > 1 ? (
              <Badge variant="error" size="sm">
                <AlertTriangle size={12} /> Kelebihan {Math.round((weightValidation.total - 1) * 100)}%
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                <AlertTriangle size={12} /> Sisa {Math.round((1 - weightValidation.total) * 100)}% Belum Terisi
              </Badge>
            )}
          </div>
        </div>

        {/* Multi-segmented Colored Weight Bar */}
        <div className={styles.weightSegmentedBar}>
          {komponen.map((k, idx) => {
            const pct = Math.round((Number(k.bobot) || 0) * 100);
            const color = COMPONENT_COLORS[idx % COMPONENT_COLORS.length];
            return (
              <div 
                key={k.id} 
                className={styles.weightSegment}
                style={{ width: `${pct}%`, background: color }}
                title={`${getKomponenCode(k.name)} (${k.name}): ${pct}%`}
              />
            );
          })}
        </div>

        {/* Legend Row */}
        <div className={styles.weightLegendRow}>
          {komponen.map((k, idx) => {
            const pct = Math.round((Number(k.bobot) || 0) * 100);
            const color = COMPONENT_COLORS[idx % COMPONENT_COLORS.length];
            return (
              <div key={k.id} className={styles.weightLegendItem}>
                <span className={styles.legendDot} style={{ background: color }} />
                <span><strong>{getKomponenCode(k.name)}</strong> ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activation Warning If Needed */}
      {!isReadyToActivate && (
        <div className={styles.warningBanner}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Konfigurasi Belum Lengkap:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {!weightValidation.valid && (
                <li>Total bobot harus bernilai 100% (saat ini: {totalPercent}%).</li>
              )}
              {!allHaveRubric && (
                <li>
                  Masih ada {komponen.filter(k => !k.rubricId).length} komponen yang belum ditautkan dengan template rubrik penilaian.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* 3. CRUD COMPONENT CARDS LIST */}
      <div className={styles.komponenList}>
        {komponen.map((k, index) => {
          const code = getKomponenCode(k.name);
          const color = COMPONENT_COLORS[index % COMPONENT_COLORS.length];
          const pct = Math.round((Number(k.bobot) || 0) * 100);
          const currentRubric = rubrics.find(r => r.id === k.rubricId);

          return (
            <div key={k.id} className={styles.komponenCard}>
              {/* Left Details */}
              <div className={styles.komponenLeft}>
                <div className={styles.orderBadge}>#{index + 1}</div>
                <span 
                  className={styles.codeChip}
                  style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}
                >
                  {code}
                </span>

                <div className={styles.komponenDetails}>
                  <h3 className={styles.komponenName}>{k.name}</h3>
                  <span className={styles.komponenSubtext}>
                    {getKomponenFullName(k.name)}
                  </span>
                </div>
              </div>

              {/* Center Details: Bobot & Rubric Display */}
              <div className={styles.komponenCenter}>
                <div className={styles.bobotBadge}>
                  {pct}%
                </div>

                {/* Rubric Info Display */}
                <div className={styles.rubricInfoWrap}>
                  <div className={`${styles.rubricInfoBox} ${!currentRubric ? styles.unassigned : ''}`}>
                    <Link2 size={13} style={{ color: currentRubric ? '#059669' : '#d97706', flexShrink: 0 }} />
                    <span className={styles.rubricInfoText}>
                      {currentRubric ? `${currentRubric.name} (${currentRubric.dimensions?.length || 4} Dimensi)` : 'Belum Ditautkan Rubrik'}
                    </span>
                  </div>

                  {currentRubric && (
                    <button
                      type="button"
                      className={styles.previewRubricBtn}
                      onClick={() => setPreviewRubric(currentRubric)}
                      title="Lihat Kriteria Rubrik"
                    >
                      <Eye size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className={styles.komponenActions}>
                <button 
                  className={styles.actionIconBtn} 
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  title="Pindah ke Atas"
                >
                  <ArrowUp size={14} />
                </button>

                <button 
                  className={styles.actionIconBtn} 
                  onClick={() => handleMove(index, 1)}
                  disabled={index === komponen.length - 1}
                  title="Pindah ke Bawah"
                >
                  <ArrowDown size={14} />
                </button>

                <button 
                  className={styles.actionIconBtn} 
                  onClick={() => handleOpenEditModal(k)}
                  title="Edit Detail Komponen"
                >
                  <Edit2 size={14} />
                </button>

                <button 
                  className={styles.deleteIconBtn} 
                  onClick={() => handleDelete(k.id, k.name)}
                  title="Hapus Komponen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. TAMBAH KOMPONEN MODAL (DB Compliant) */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Komponen Penilaian"
      >
        <form onSubmit={handleSaveAdd} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nama Komponen Penilaian</label>
            <Input
              placeholder="Contoh: Hasil Proyek, Tugas Praktikum"
              value={addForm.name}
              onChange={(e) => setAddForm(prev => ({ ...prev, name: capitalizeWords(e.target.value) }))}
              required
              autoFocus
            />
            {/* Quick Preset Chips */}
            <div className={styles.presetsRow}>
              {NAME_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset}
                  className={styles.presetChip}
                  onClick={() => setAddForm(prev => ({ ...prev, name: preset }))}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bobot Penilaian (%)</label>
            <Input
              type="number"
              min="1"
              max="100"
              placeholder="Contoh: 20"
              value={addForm.bobotPct}
              onChange={(e) => setAddForm(prev => ({ ...prev, bobotPct: e.target.value }))}
              required
            />
            {/* Quick Bobot Chips */}
            <div className={styles.presetsRow}>
              {BOBOT_PRESETS.map(b => (
                <button
                  type="button"
                  key={b}
                  className={styles.presetChip}
                  onClick={() => setAddForm(prev => ({ ...prev, bobotPct: b }))}
                >
                  {b}%
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tautkan Template Rubrik Penilaian</label>
            <select
              className={styles.formSelect}
              value={addForm.rubricId}
              onChange={(e) => setAddForm(prev => ({ ...prev, rubricId: e.target.value }))}
              required
            >
              <option value="">-- Pilih Template Rubrik --</option>
              {rubrics.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.dimensions?.length || 4} Dimensi EPIC)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={!addForm.name.trim()}>
              <PlusCircle size={16} /> Simpan Komponen
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. EDIT KOMPONEN MODAL (DB Compliant) */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Komponen Penilaian"
      >
        <form onSubmit={handleSaveEdit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nama Komponen Penilaian</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: capitalizeWords(e.target.value) }))}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bobot Penilaian (%)</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={editForm.bobotPct}
              onChange={(e) => setEditForm(prev => ({ ...prev, bobotPct: e.target.value }))}
              required
            />
            {/* Quick Bobot Chips */}
            <div className={styles.presetsRow}>
              {BOBOT_PRESETS.map(b => (
                <button
                  type="button"
                  key={b}
                  className={styles.presetChip}
                  onClick={() => setEditForm(prev => ({ ...prev, bobotPct: b }))}
                >
                  {b}%
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tautkan Template Rubrik Penilaian</label>
            <select
              className={styles.formSelect}
              value={editForm.rubricId}
              onChange={(e) => setEditForm(prev => ({ ...prev, rubricId: e.target.value }))}
            >
              <option value="">-- Pilih Template Rubrik --</option>
              {rubrics.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.dimensions?.length || 4} Dimensi EPIC)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={!editForm.name.trim()}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. RUBRIC PREVIEW MODAL */}
      {previewRubric && (
        <Modal
          isOpen={!!previewRubric}
          onClose={() => setPreviewRubric(null)}
          title={`Detail Rubrik: ${previewRubric.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              {previewRubric.description || 'Tidak ada deskripsi.'}
            </p>

            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
              Kriteria Dimensi Evaluasi ({previewRubric.dimensions?.length || 0} Dimensi):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(previewRubric.dimensions || []).map((dim, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    background: 'var(--bg-card, #f8fafc)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: '#2563eb' }}>[{dim.code}] {dim.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>Bobot: {Math.round((dim.weight || 0) * 100)}%</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Likert 4 (Sangat Baik): {dim.feedback_4 || '-'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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

export default KomponenPenilaianPage;

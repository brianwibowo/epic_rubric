import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { validateWeightsSum } from '@/utils/scoringEngine';
import styles from './KomponenPenilaianPage.module.css';
import { 
  PlusCircle, Trash2, Edit2, Save, X, 
  Link2, CheckCircle2, AlertTriangle, ArrowRight, Eye
} from 'lucide-react';

import HelpButton from '@/components/ui/HelpButton';

const KomponenPenilaianPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { getMKById, updateKomponenList, assignRubricToKomponen } = useMKStore();
  const { rubrics } = useRubricStore();
  const { addToast } = useUiStore();

  const mk = getMKById(mkId);
  const [komponen, setKomponen] = useState(mk?.komponen || []);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBobot, setEditBobot] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningKomponenId, setAssigningKomponenId] = useState(null);
  const [newName, setNewName] = useState('');
  const [previewRubric, setPreviewRubric] = useState(null);

  useEffect(() => {
    if (mk?.komponen) {
      setKomponen(mk.komponen);
    }
  }, [mk]);

  const weights = komponen.map(k => k.bobot || 0);
  const weightValidation = validateWeightsSum(weights);
  const totalPercent = (weightValidation.total * 100).toFixed(1);
  const allHaveRubric = komponen.every(k => k.rubricId);
  const isReadyToActivate = weightValidation.valid && allHaveRubric;

  const handleStartEdit = (k) => {
    setEditingId(k.id);
    setEditName(k.name);
    setEditBobot((k.bobot * 100).toString());
  };

  const handleSaveEdit = (id) => {
    const updated = komponen.map(k => 
      k.id === id ? { ...k, name: editName, bobot: parseFloat(editBobot) / 100 || 0 } : k
    );
    setKomponen(updated);
    updateKomponenList(mkId, updated);
    setEditingId(null);
    addToast('Komponen berhasil diperbarui', 'success');
  };

  const handleDelete = (id) => {
    const updated = komponen.filter(k => k.id !== id);
    setKomponen(updated);
    updateKomponenList(mkId, updated);
    addToast('Komponen dihapus', 'info');
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newK = {
      id: `k-${Date.now()}`,
      name: newName.trim(),
      bobot: 0,
      rubricName: null,
      rubricId: null,
      urutan: komponen.length + 1
    };
    const updated = [...komponen, newK];
    setKomponen(updated);
    updateKomponenList(mkId, updated);
    setNewName('');
    setShowAddModal(false);
    addToast(`Komponen "${newK.name}" ditambahkan`, 'success');
  };

  const handleOpenAssignModal = (komponenId) => {
    setAssigningKomponenId(komponenId);
    setShowAssignModal(true);
  };

  const handleSelectRubric = (rubric) => {
    assignRubricToKomponen(mkId, assigningKomponenId, rubric.id, rubric.name);
    setShowAssignModal(false);
    setAssigningKomponenId(null);
    addToast(`Rubrik "${rubric.name}" di-assign ke komponen!`, 'success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Komponen Penilaian</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>Konfigurasi komponen, bobot, dan assign rubrik untuk {mk?.name}</p>
        </div>
        <Button variant="outline" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={18} />
          Tambah Komponen
        </Button>
      </div>

      {/* Weight Summary Bar */}
      <div className={styles.weightSummary}>
        <div className={styles.weightBarTrack}>
          <div 
            className={`${styles.weightBarFill} ${weightValidation.valid ? styles.valid : weightValidation.total > 1 ? styles.over : styles.under}`}
            style={{ width: `${Math.min(parseFloat(totalPercent), 100)}%` }}
          />
        </div>
        <div className={styles.weightInfo}>
          <span className={styles.weightLabel}>Total Bobot:</span>
          <span className={`${styles.weightValue} ${weightValidation.valid ? styles.valid : styles.invalid}`}>
            {totalPercent}%
          </span>
          {weightValidation.valid ? (
            <Badge variant="success" size="sm"><CheckCircle2 size={12} /> Tepat 100%</Badge>
          ) : (
            <Badge variant="error" size="sm">
              <AlertTriangle size={12} /> 
              {weightValidation.total > 1 ? `Kelebihan ${((weightValidation.total - 1) * 100).toFixed(1)}%` : `Sisa ${((1 - weightValidation.total) * 100).toFixed(1)}%`}
            </Badge>
          )}
        </div>
      </div>

      {/* Activation Status */}
      {!isReadyToActivate && (
        <div className={styles.activationWarning}>
          <AlertTriangle size={16} />
          <div>
            <strong>MK belum bisa diaktifkan.</strong>
            <span> Pastikan:</span>
            <ul>
              {!weightValidation.valid && <li>Total bobot = 100% (saat ini: {totalPercent}%)</li>}
              {!allHaveRubric && <li>Semua komponen sudah di-assign rubrik ({komponen.filter(k => !k.rubricId).length} belum)</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Komponen List */}
      <div className={styles.list}>
        {komponen.map((k, index) => (
          <div key={k.id} className={styles.item}>
            {editingId === k.id ? (
              /* Edit Mode */
              <div className={styles.itemEditMode}>
                <div className={styles.editFields}>
                  <input
                    className={styles.editInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama komponen"
                    autoFocus
                  />
                  <div className={styles.bobotInput}>
                    <input
                      className={styles.editInputSmall}
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={editBobot}
                      onChange={(e) => setEditBobot(e.target.value)}
                    />
                    <span className={styles.bobotUnit}>%</span>
                  </div>
                </div>
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={() => handleSaveEdit(k.id)}>
                    <Save size={16} /> Simpan
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className={styles.itemLeft}>
                  <div className={styles.itemOrder}>{index + 1}</div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{k.name}</h4>
                    <div className={styles.itemRubric}>
                      {k.rubricName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            className={styles.rubricLinked} 
                            onClick={() => handleOpenAssignModal(k.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Link2 size={12} /> {k.rubricName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewRubric(rubrics.find(r => r.id === k.rubricId))}
                            title="Lihat Isi Rubrik"
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 4px',
                              borderRadius: '4px'
                            }}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className={styles.assignRubricBtn}
                          onClick={() => handleOpenAssignModal(k.id)}
                        >
                          <Link2 size={12} /> Assign Rubrik
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <div className={styles.bobotDisplay}>
                    <span className={styles.bobotValue}>{k.bobot ? (k.bobot * 100).toFixed(0) : '0'}%</span>
                  </div>
                  <div className={styles.itemActions}>
                    {k.rubricId && (
                      <button 
                        className={styles.scoringBtn}
                        onClick={() => navigate(`/mk/${mkId}/komponen/${k.id}/scoring`)}
                        title="Input Nilai"
                      >
                        <ArrowRight size={14} /> Scoring
                      </button>
                    )}
                    <button className={styles.editBtn} onClick={() => handleStartEdit(k)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(k.id)} title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Komponen Penilaian">
        <div className={styles.addForm}>
          <Input
            label="Nama Komponen"
            placeholder="e.g. Presentasi Praktikum, Ujian Lisan"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className={styles.addFormActions}>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleAdd} disabled={!newName.trim()}>
              <PlusCircle size={16} /> Tambah
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Rubric Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Pilih Template Rubrik">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Pilih salah satu template rubrik untuk di-assign ke komponen ini:
          </p>
          {rubrics.map(r => (
            <div 
              key={r.id} 
              onClick={() => handleSelectRubric(r)}
              style={{ 
                padding: '14px 16px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                background: 'var(--bg-surface)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '4px' }}>{r.name}</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{r.description}</p>
            </div>
          ))}
        </div>
      </Modal>

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

export default KomponenPenilaianPage;

import React, { useState } from 'react';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { getDimensionColor } from '@/utils/constants';
import { capitalizeWords, capitalizeFirstLetter } from '@/utils/formatters';
import styles from './RubrikLibraryPage.module.css';
import { PlusCircle, Edit2, Trash2, Layers, Eye, Plus, X } from 'lucide-react';
import HelpButton from '@/components/ui/HelpButton';

const RubrikLibraryPage = () => {
  const { rubrics, createRubric, updateRubric, deleteRubric } = useRubricStore();
  const { addToast } = useUiStore();

  const [selectedRubric, setSelectedRubric] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);

  // New Rubric Form state
  const [newRubricName, setNewRubricName] = useState('');
  const [newRubricDesc, setNewRubricDesc] = useState('');
  const [dimensions, setDimensions] = useState([
    { code: 'E', name: 'Evaluative Understanding', weight: 0.30 },
    { code: 'P', name: 'Predictive Reasoning', weight: 0.30 },
    { code: 'I', name: 'Intelligent Application', weight: 0.40 },
  ]);

  // Edit Rubric Form state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDimensions, setEditDimensions] = useState([]);

  // Add/Remove Create Dim
  const handleAddDimension = () => {
    const nextCode = `DIM${dimensions.length + 1}`;
    setDimensions(prev => [...prev, { code: nextCode, name: `Dimensi ${dimensions.length + 1}`, weight: 0.10 }]);
  };
  const handleRemoveDimension = (idx) => {
    setDimensions(prev => prev.filter((_, i) => i !== idx));
  };
  const handleDimChange = (idx, field, val) => {
    setDimensions(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };

  // Add/Remove Edit Dim
  const handleAddEditDimension = () => {
    const nextCode = `DIM${editDimensions.length + 1}`;
    setEditDimensions(prev => [...prev, { code: nextCode, name: `Dimensi ${editDimensions.length + 1}`, weight: 0.10 }]);
  };
  const handleRemoveEditDimension = (idx) => {
    setEditDimensions(prev => prev.filter((_, i) => i !== idx));
  };
  const handleEditDimChange = (idx, field, val) => {
    setEditDimensions(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };

  const handleCreateSubmit = () => {
    if (!newRubricName.trim()) return;

    createRubric({
      name: newRubricName.trim(),
      description: newRubricDesc.trim(),
      dimensions
    });

    addToast(`Template Rubrik "${newRubricName}" berhasil dibuat!`, 'success');
    setShowCreateModal(false);
    setNewRubricName('');
    setNewRubricDesc('');
  };

  const handleStartEdit = (rubric) => {
    setEditingRubric(rubric);
    setEditName(rubric.name || '');
    setEditDesc(rubric.description || '');
    setEditDimensions(rubric.dimensions ? JSON.parse(JSON.stringify(rubric.dimensions)) : []);
  };

  const handleSaveEdit = () => {
    if (!editingRubric || !editName.trim()) return;

    updateRubric(editingRubric.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      dimensions: editDimensions
    });

    addToast(`Template Rubrik "${editName}" berhasil diperbarui!`, 'success');
    setEditingRubric(null);
  };

  const handleDelete = (rubric) => {
    if (window.confirm(`Hapus template rubrik "${rubric.name}"?`)) {
      deleteRubric(rubric.id);
      addToast('Template rubrik dihapus', 'info');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Template Rubrik</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>Library rubrik yang bisa digunakan ulang di berbagai mata kuliah</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} /> Buat Rubrik Baru
        </Button>
      </div>

      <div className={styles.grid}>
        {rubrics.map((rubric, ri) => (
          <div key={rubric.id} className={styles.rubricCard}>
            <div className={styles.rubricHeader}>
              <div className={styles.rubricIcon}>
                <Layers size={20} />
              </div>
              <div className={styles.rubricActions}>
                <button className={styles.actionBtn} title="Preview Detail" onClick={() => setSelectedRubric(rubric)}>
                  <Eye size={14} />
                </button>
                <button className={styles.actionBtn} title="Edit Template" onClick={() => handleStartEdit(rubric)}>
                  <Edit2 size={14} />
                </button>
                <button className={styles.actionBtn} title="Hapus" onClick={() => handleDelete(rubric)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h3 className={styles.rubricName}>{rubric.name}</h3>
            <p className={styles.rubricDesc}>{rubric.description}</p>

            {/* Dimension Pills */}
            <div className={styles.dimPills}>
              {(rubric.dimensions || []).map((d, di) => (
                <span 
                  key={d.code} 
                  className={styles.dimPill}
                  style={{ 
                    color: getDimensionColor(di).hex, 
                    background: getDimensionColor(di).bg 
                  }}
                >
                  {d.code} {((d.weight || 0) * 100).toFixed(0)}%
                </span>
              ))}
            </div>

            <div className={styles.rubricFooter}>
              <span className={styles.usedCount}>
                {(rubric.usedIn || []).length > 0 ? `Dipakai di ${rubric.usedIn.length} MK` : 'Belum dipakai di MK'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal 
        isOpen={!!selectedRubric} 
        onClose={() => setSelectedRubric(null)} 
        title={selectedRubric?.name || 'Detail Rubrik'}
      >
        {selectedRubric && (
          <div className={styles.previewContent}>
            <p className={styles.previewDesc}>{selectedRubric.description}</p>
            <h4 className={styles.previewSectionTitle}>Dimensi Penilaian</h4>
            <div className={styles.previewDims}>
              {(selectedRubric.dimensions || []).map((d, di) => (
                <div key={d.code} className={styles.previewDim}>
                  <div className={styles.previewDimHeader}>
                    <span 
                      className={styles.previewDimCode}
                      style={{ background: getDimensionColor(di).bg, color: getDimensionColor(di).hex }}
                    >
                      {d.code}
                    </span>
                    <span className={styles.previewDimName}>{d.name}</span>
                    <span className={styles.previewDimWeight}>{((d.weight || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className={styles.previewDimBar}>
                    <div 
                      className={styles.previewDimFill} 
                      style={{ width: `${(d.weight || 0) * 100}%`, background: getDimensionColor(di).hex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Rubric Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Template Rubrik Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nama Template Rubrik"
            placeholder="e.g. Rubrik Presentasi Kasus"
            value={newRubricName}
            onChange={(e) => setNewRubricName(capitalizeWords(e.target.value))}
          />
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Deskripsi</label>
            <textarea
              style={{ 
                width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: 'var(--font-sans)',
                background: 'var(--bg-surface)', color: 'var(--text-primary)'
              }}
              rows={2}
              placeholder="Deskripsi singkat penggunaan rubrik..."
              value={newRubricDesc}
              onChange={(e) => setNewRubricDesc(capitalizeFirstLetter(e.target.value))}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 700 }}>Dimensi Penilaian</label>
              <Button variant="ghost" size="sm" onClick={handleAddDimension}>
                <Plus size={14} /> Tambah Dimensi
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dimensions.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={{ width: '60px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    value={d.code}
                    onChange={(e) => handleDimChange(idx, 'code', e.target.value.toUpperCase())}
                    placeholder="Kode"
                  />
                  <input
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px' }}
                    value={d.name}
                    onChange={(e) => handleDimChange(idx, 'name', capitalizeWords(e.target.value))}
                    placeholder="Nama Dimensi"
                  />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    style={{ width: '70px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', textAlign: 'right' }}
                    value={d.weight}
                    onChange={(e) => handleDimChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                  />
                  {dimensions.length > 1 && (
                    <button onClick={() => handleRemoveDimension(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleCreateSubmit} disabled={!newRubricName.trim()}>
              Simpan Template Rubrik
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Rubric Modal */}
      <Modal isOpen={!!editingRubric} onClose={() => setEditingRubric(null)} title={`Edit Template: ${editingRubric?.name || ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nama Template Rubrik"
            placeholder="e.g. Rubrik Presentasi Kasus"
            value={editName}
            onChange={(e) => setEditName(capitalizeWords(e.target.value))}
          />
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Deskripsi</label>
            <textarea
              style={{ 
                width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: 'var(--font-sans)',
                background: 'var(--bg-surface)', color: 'var(--text-primary)'
              }}
              rows={2}
              placeholder="Deskripsi singkat penggunaan rubrik..."
              value={editDesc}
              onChange={(e) => setEditDesc(capitalizeFirstLetter(e.target.value))}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 700 }}>Dimensi Penilaian</label>
              <Button variant="ghost" size="sm" onClick={handleAddEditDimension}>
                <Plus size={14} /> Tambah Dimensi
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {editDimensions.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={{ width: '60px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    value={d.code}
                    onChange={(e) => handleEditDimChange(idx, 'code', e.target.value.toUpperCase())}
                    placeholder="Kode"
                  />
                  <input
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px' }}
                    value={d.name}
                    onChange={(e) => handleEditDimChange(idx, 'name', capitalizeWords(e.target.value))}
                    placeholder="Nama Dimensi"
                  />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    style={{ width: '70px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', textAlign: 'right' }}
                    value={d.weight}
                    onChange={(e) => handleEditDimChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                  />
                  {editDimensions.length > 1 && (
                    <button onClick={() => handleRemoveEditDimension(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setEditingRubric(null)}>Batal</Button>
            <Button variant="primary" onClick={handleSaveEdit} disabled={!editName.trim()}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RubrikLibraryPage;

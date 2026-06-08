import React, { useState } from 'react';
import { useRubric } from '@/hooks/useRubric';
import { useUiStore } from '@/stores/uiStore';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import RubricConfigurator from '@/components/rubric/RubricConfigurator';
import DataTable from '@/components/ui/DataTable';
import { Trash2, ShieldAlert, Plus, Check, RefreshCw } from 'lucide-react';
import styles from './RubricConfigPage.module.css';

const RubricConfigPage = () => {
  const { templates, isLoading, saveTemplate, deleteTemplate, fetchTemplates } = useRubric();
  const { addToast } = useUiStore();
  
  const [showConfigurator, setShowConfigurator] = useState(false);

  const handleSave = async (name, weights, isMaster) => {
    try {
      await saveTemplate(name, weights, isMaster);
      setShowConfigurator(false);
    } catch (e) {
      // Handled inside hook
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nama Master Templat',
      sortable: true,
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.tableName}>{row.name}</span>
          {row.is_master && (
            <Badge variant="epic" size="sm" glow className={styles.masterBadge}>
              MASTER TEMPLATE
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'weights',
      label: 'Pembobotan (E / P / I / C / PE)',
      render: (row) => {
        const percentE = Math.round(row.weight_e * 100);
        const percentP = Math.round(row.weight_p * 100);
        const percentI = Math.round(row.weight_i * 100);
        const percentC = Math.round(row.weight_c * 100);
        const percentPE = Math.round(row.weight_pe * 100);
        return (
          <div className={styles.weightsRow}>
            <span className={styles.weightItem} style={{ color: 'var(--color-epic-e)' }}>{percentE}%</span>
            <span className={styles.weightSlash}>/</span>
            <span className={styles.weightItem} style={{ color: 'var(--color-epic-p)' }}>{percentP}%</span>
            <span className={styles.weightSlash}>/</span>
            <span className={styles.weightItem} style={{ color: 'var(--color-epic-i)' }}>{percentI}%</span>
            <span className={styles.weightSlash}>/</span>
            <span className={styles.weightItem} style={{ color: 'var(--color-epic-c)' }}>{percentC}%</span>
            <span className={styles.weightSlash}>/</span>
            <span className={styles.weightItem} style={{ color: 'var(--color-epic-pe)' }}>{percentPE}%</span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Dibuat Pada',
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={row.is_master} // Prevent deleting master templates for security
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Hapus template "${row.name}"?`)) {
              deleteTemplate(row.id);
            }
          }}
          className={styles.deleteBtn}
          iconLeft={<Trash2 size={16} />}
        >
          Hapus
        </Button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <Header
        title="Pengaturan Rubrik"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchTemplates}
              disabled={isLoading}
              iconLeft={<RefreshCw size={14} />}
            >
              Segarkan
            </Button>
            
            <Button
              variant="epic"
              size="sm"
              onClick={() => setShowConfigurator(!showConfigurator)}
              iconLeft={<Plus size={16} />}
            >
              {showConfigurator ? 'Daftar Templat' : 'Templat Baru'}
            </Button>
          </div>
        }
      />

      <div className={styles.content}>
        {showConfigurator ? (
          <div className="animate-fade-in">
            <RubricConfigurator 
              onSave={handleSave} 
              isLoading={isLoading} 
            />
          </div>
        ) : (
          <div className={`${styles.tableWrapper} animate-fade-in`}>
            <div className={styles.metaCard}>
              <ShieldAlert className={styles.metaIcon} size={20} />
              <p className={styles.metaText}>
                <strong>Catatan Keamanan:</strong> Master Template bertindak sebagai acuan utama persentase bobot kalkulasi di sisi server. Konfigurasi master tidak dapat dihapus secara bebas untuk menjaga konsistensi nilai rapor yang telah diterbitkan.
              </p>
            </div>

            <DataTable
              columns={columns}
              data={templates}
              isLoading={isLoading}
              pagination={true}
              pageSize={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RubricConfigPage;

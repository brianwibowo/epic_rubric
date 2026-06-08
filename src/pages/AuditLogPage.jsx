import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import { formatDate } from '@/utils/formatters';
import { RefreshCw, ShieldAlert, History } from 'lucide-react';
import styles from './AuditLogPage.module.css';

// Initial seed data for demo preview
const INITIAL_MOCK_LOGS = [
  {
    id: 'log-1',
    user_email: 'guru@epic.id',
    user_name: 'Dra. Sri Wahyuni',
    action_type: 'FINALIZE_SCORE',
    target_student: 'Ahmad Rifai',
    ip_address: '192.168.10.45',
    created_at: '2026-06-08T08:35:10Z'
  },
  {
    id: 'log-2',
    user_email: 'admin@epic.id',
    user_name: 'Budi Santoso, M.Pd.',
    action_type: 'REOPEN_REMEDIAL',
    target_student: 'Ahmad Rifai',
    ip_address: '192.168.10.12',
    created_at: '2026-06-08T09:12:44Z'
  },
  {
    id: 'log-3',
    user_email: 'guru@epic.id',
    user_name: 'Dra. Sri Wahyuni',
    action_type: 'CREATE_DRAFT',
    target_student: 'Citra Lestari',
    ip_address: '192.168.10.45',
    created_at: '2026-06-09T02:15:20Z'
  },
  {
    id: 'log-4',
    user_email: 'guru@epic.id',
    user_name: 'Dra. Sri Wahyuni',
    action_type: 'SENT_TO_ANALYTICS',
    target_student: 'Citra Lestari',
    ip_address: '192.168.10.45',
    created_at: '2026-06-09T03:00:15Z'
  }
];

const MOCK_AUDIT_LOGS_KEY = 'epic_mock_audit_logs';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('ALL');

  const loadLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      let localData = localStorage.getItem(MOCK_AUDIT_LOGS_KEY);
      if (!localData) {
        localStorage.setItem(MOCK_AUDIT_LOGS_KEY, JSON.stringify(INITIAL_MOCK_LOGS));
        localData = JSON.stringify(INITIAL_MOCK_LOGS);
      }
      const parsedLogs = JSON.parse(localData);
      // Sort newest first
      const sorted = parsedLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLogs(sorted);
      setFilteredLogs(sorted);
      setIsLoading(false);
    }, 450);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs by action type
  useEffect(() => {
    if (selectedAction === 'ALL') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.action_type === selectedAction));
    }
  }, [selectedAction, logs]);

  const handleClearLogs = () => {
    if (confirm('Hapus seluruh log riwayat aktivitas? Tindakan ini tidak bisa dibatalkan.')) {
      localStorage.setItem(MOCK_AUDIT_LOGS_KEY, JSON.stringify([]));
      setLogs([]);
    }
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Waktu Aktivitas',
      sortable: true,
      render: (row) => <span className={styles.monoText}>{formatDate(row.created_at, true)}</span>
    },
    {
      key: 'user_name',
      label: 'Evaluator (Pengguna)',
      sortable: true,
      render: (row) => (
        <div className={styles.userCell}>
          <strong>{row.user_name}</strong>
          <span className={styles.userEmail}>{row.user_email}</span>
        </div>
      )
    },
    {
      key: 'action_type',
      label: 'Jenis Aksi',
      sortable: true,
      render: (row) => {
        let badgeVariant = 'primary';
        let actionLabel = row.action_type;
        
        if (row.action_type === 'FINALIZE_SCORE') {
          badgeVariant = 'info';
          actionLabel = 'LOCK FINAL';
        } else if (row.action_type === 'REOPEN_REMEDIAL') {
          badgeVariant = 'error';
          actionLabel = 'REMEDIAL OPEN';
        } else if (row.action_type === 'SENT_TO_ANALYTICS') {
          badgeVariant = 'success';
          actionLabel = 'SENT ANALYTICS';
        } else if (row.action_type === 'CREATE_DRAFT') {
          badgeVariant = 'warning';
          actionLabel = 'SAVE DRAFT';
        }

        return (
          <Badge variant={badgeVariant} size="sm" glow>
            {actionLabel}
          </Badge>
        );
      }
    },
    {
      key: 'target_student',
      label: 'Target Siswa',
      sortable: true,
      render: (row) => <span>{row.target_student || '-'}</span>
    },
    {
      key: 'ip_address',
      label: 'Alamat IP Client',
      render: (row) => <span className={styles.monoText}>{row.ip_address}</span>
    }
  ];

  return (
    <div className={styles.container}>
      <Header
        title="Audit Activity Logs"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadLogs}
              disabled={isLoading}
              iconLeft={<RefreshCw size={14} />}
            >
              Segarkan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={isLoading || logs.length === 0}
            >
              Reset Logs
            </Button>
          </div>
        }
      />

      <div className={styles.content}>
        {/* Warn Card */}
        <Card variant="glass" padding="md" className={styles.warningCard}>
          <ShieldAlert className={styles.warningIcon} size={22} />
          <div className={styles.warningInfo}>
            <h4 className={styles.warningTitle}>Integrasi Catatan Transaksi Keamanan</h4>
            <p className={styles.warningText}>
              Seluruh transisi status penilaian siswa dari DRAFT ke FINALIZED, serta pembukaan kunci status (remedial) oleh admin terekam secara permanen di database SQL untuk mencegah manipulasi nilai secara ilegal.
            </p>
          </div>
        </Card>

        {/* Filters and Table */}
        <Card variant="glass" padding="md" className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitleRow}>
              <History size={18} className={styles.historyIcon} />
              <h4 className={styles.tableTitle}>Riwayat Aksi Evaluator</h4>
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className={styles.select}
            >
              <option value="ALL">Semua Jenis Aksi</option>
              <option value="CREATE_DRAFT">Save Draft</option>
              <option value="FINALIZE_SCORE">Finalize (Lock)</option>
              <option value="SENT_TO_ANALYTICS">Sent (Release)</option>
              <option value="REOPEN_REMEDIAL">Remedial (Unlock)</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={filteredLogs}
            isLoading={isLoading}
            pagination={true}
            pageSize={10}
          />
        </Card>
      </div>
    </div>
  );
};

export default AuditLogPage;

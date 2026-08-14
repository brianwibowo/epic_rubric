import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLES, ROLE_LABELS } from '@/utils/constants';
import { capitalizeWords } from '@/utils/formatters';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Info, 
  ShieldAlert, 
  User, 
  BookOpen, 
  Check,
  GraduationCap,
  School,
  ShieldCheck
} from 'lucide-react';
import styles from './UserManagementPage.module.css';

const UserManagementPage = () => {
  const { isMock } = useAuthStore();
  const { addToast } = useUiStore();
  const { 
    isLoading, 
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUserManagement();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, admin, dosen, guru, mahasiswa, siswa

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: ROLES.DOSEN,
    nim: '',
    nisn: '',
    nidn: '',
    nip: '',
    unit_info: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch initial data
  const loadData = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    loadData();
  }, [fetchUsers]);

  // Filters and search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesTab = activeTab === 'ALL' || user.role === activeTab;
      const cleanSearch = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !cleanSearch || 
        user.full_name?.toLowerCase().includes(cleanSearch) || 
        user.email?.toLowerCase().includes(cleanSearch) || 
        (user.nip && String(user.nip).includes(cleanSearch)) || 
        (user.nidn && String(user.nidn).includes(cleanSearch)) || 
        (user.nim && String(user.nim).includes(cleanSearch)) || 
        (user.nisn && String(user.nisn).includes(cleanSearch)) ||
        (user.unit_info && user.unit_info.toLowerCase().includes(cleanSearch));
      
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormData({
      full_name: '',
      email: '',
      role: ROLES.DOSEN,
      nim: '',
      nisn: '',
      nidn: '',
      nip: '',
      unit_info: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || ROLES.DOSEN,
      nim: user.nim || '',
      nisn: user.nisn || '',
      nidn: user.nidn || '',
      nip: user.nip || '',
      unit_info: user.unit_info || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDeleteUser = async (user) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun "${user.full_name}"?`)) {
      try {
        await deleteUser(user.id);
        loadData();
      } catch (error) {
        // Handled by hook toasts
      }
    }
  };

  // Form input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'full_name' || name === 'unit_info') {
      formattedValue = capitalizeWords(value);
    } else if (name === 'nim' || name === 'nisn' || name === 'nidn' || name === 'nip') {
      formattedValue = value.trim().toUpperCase();
    }
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (formData.role === ROLES.MAHASISWA) {
      if (!formData.nim.trim()) errors.nim = 'NIM wajib diisi untuk Mahasiswa';
    } else if (formData.role === ROLES.SISWA) {
      if (!formData.nisn.trim()) errors.nisn = 'NISN wajib diisi untuk Siswa';
    } else if (formData.role === ROLES.DOSEN) {
      if (!formData.nidn.trim() && !formData.nip.trim()) {
        errors.nidn = 'NIDN atau NIP wajib diisi untuk Dosen';
      }
    } else if (formData.role === ROLES.GURU) {
      if (!formData.nip.trim()) errors.nip = 'NIP wajib diisi untuk Guru';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      // Toast managed by hook
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      key: 'user',
      label: 'Nama & Akun Pengguna',
      sortable: true,
      render: (row) => (
        <div className={styles.userCell}>
          <img 
            src={row.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.full_name)}`}
            alt={row.full_name}
            className={styles.avatar} 
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{row.full_name}</span>
            <span className={styles.userEmail}>{row.email || `${row.role}@epic.id`}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Peran (Role)',
      sortable: true,
      render: (row) => {
        let badgeVariant = 'primary';
        let badgeLabel = ROLE_LABELS[row.role] || row.role;
        let isGlow = false;

        switch (row.role) {
          case ROLES.ADMIN:
            badgeVariant = 'error';
            badgeLabel = 'Admin';
            isGlow = true;
            break;
          case ROLES.DOSEN:
            badgeVariant = 'primary';
            badgeLabel = 'Dosen (Univ)';
            break;
          case ROLES.GURU:
            badgeVariant = 'info';
            badgeLabel = 'Guru (SMK)';
            break;
          case ROLES.MAHASISWA:
            badgeVariant = 'success';
            badgeLabel = 'Mahasiswa';
            break;
          case ROLES.SISWA:
            badgeVariant = 'warning';
            badgeLabel = 'Siswa (SMK)';
            break;
          default:
            badgeVariant = 'default';
        }

        return (
          <Badge variant={badgeVariant} size="sm" glow={isGlow}>
            {badgeLabel}
          </Badge>
        );
      }
    },
    {
      key: 'identity',
      label: 'Nomor Identitas',
      render: (row) => {
        if (row.role === ROLES.MAHASISWA) {
          return <span className={styles.idText}>NIM: {row.nim || '-'}</span>;
        }
        if (row.role === ROLES.SISWA) {
          return <span className={styles.idText}>NISN: {row.nisn || '-'}</span>;
        }
        if (row.role === ROLES.DOSEN) {
          return <span className={styles.idText}>NIDN: {row.nidn || row.nip || '-'}</span>;
        }
        if (row.role === ROLES.GURU) {
          return <span className={styles.idText}>NIP: {row.nip || '-'}</span>;
        }
        if (row.role === ROLES.ADMIN) {
          return <span className={styles.idText}>{row.nip ? `NIP: ${row.nip}` : 'Admin Sistem'}</span>;
        }
        return <span className={styles.idText}>-</span>;
      }
    },
    {
      key: 'unit_info',
      label: 'Unit / Program / Kelas',
      sortable: true,
      render: (row) => (
        <span className={styles.classText}>
          {row.unit_info || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => (
        <div className={styles.actionCell}>
          <button 
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => handleOpenEditModal(row)}
            title="Edit Informasi Akun"
          >
            <Edit2 size={14} />
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => handleDeleteUser(row)}
            title="Hapus Akun"
            disabled={row.id === 'mock-admin-uuid'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <Header 
        title="Manajemen Pengguna & Peran" 
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} /> Tambah Pengguna Baru
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Tip / Notification */}
        {isMock && (
          <div className={styles.mockAlert}>
            <Info className={styles.mockIcon} size={18} />
            <div>
              <strong>Mode Manajemen Akun:</strong> Admin dapat membuat akun sesama <strong>Admin</strong>, <strong>Dosen</strong> (Universitas), <strong>Guru</strong> (SMK), <strong>Mahasiswa</strong>, dan <strong>Siswa</strong> dengan identitas yang tersinkronisasi.
            </div>
          </div>
        )}

        {/* Toolbar filter */}
        <div className={styles.toolbar}>
          <div className={styles.leftSection}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari nama, email, NIM, NISN, NIDN, NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.tabs}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                Semua ({users.length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === ROLES.ADMIN ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(ROLES.ADMIN)}
              >
                Admin ({users.filter(u => u.role === ROLES.ADMIN).length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === ROLES.DOSEN ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(ROLES.DOSEN)}
              >
                Dosen ({users.filter(u => u.role === ROLES.DOSEN).length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === ROLES.GURU ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(ROLES.GURU)}
              >
                Guru ({users.filter(u => u.role === ROLES.GURU).length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === ROLES.MAHASISWA ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(ROLES.MAHASISWA)}
              >
                Mahasiswa ({users.filter(u => u.role === ROLES.MAHASISWA).length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === ROLES.SISWA ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(ROLES.SISWA)}
              >
                Siswa ({users.filter(u => u.role === ROLES.SISWA).length})
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card variant="glass" padding="none" className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
            pagination={true}
            pageSize={10}
            emptyStateMessage="Tidak ada akun pengguna yang cocok dengan pencarian Anda."
          />
        </Card>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit Informasi Pengguna' : 'Daftarkan Akun Pengguna Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nama Lengkap <span className={styles.required}>*</span>
            </label>
            <Input
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Contoh: Dra. Sri Wahyuni, M.Ak. atau Ahmad Rifai"
              error={formErrors.full_name}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Alamat Email <span className={styles.required}>*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Contoh: user@epic.id"
              error={formErrors.email}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Pilihan Peran (Role) <span className={styles.required}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={styles.select}
              disabled={!!selectedUser && selectedUser.id === 'mock-admin-uuid'}
            >
              <option value={ROLES.ADMIN}>🛡️ Admin (Hak Akses Penuh & Manajemen Akun)</option>
              <option value={ROLES.DOSEN}>👨‍🏫 Dosen (Perguruan Tinggi / Vokasi)</option>
              <option value={ROLES.GURU}>👩‍🏫 Guru (Sekolah Menengah Kejuruan / SMK)</option>
              <option value={ROLES.MAHASISWA}>🎓 Mahasiswa (Perguruan Tinggi / Vokasi)</option>
              <option value={ROLES.SISWA}>🎒 Siswa (Sekolah Menengah Kejuruan / SMK)</option>
            </select>
          </div>

          {/* DYNAMIC IDENTITY FIELDS ACCORDING TO ROLE */}
          {formData.role === ROLES.ADMIN && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Unit / Lembaga Admin
              </label>
              <Input
                name="unit_info"
                value={formData.unit_info}
                onChange={handleInputChange}
                placeholder="Contoh: Pusat Asesmen & Penjaminan Mutu"
              />
            </div>
          )}

          {formData.role === ROLES.DOSEN && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nomor Induk Dosen Nasional (NIDN / NIP) <span className={styles.required}>*</span>
                </label>
                <Input
                  name="nidn"
                  value={formData.nidn || formData.nip}
                  onChange={(e) => {
                    handleInputChange({ target: { name: 'nidn', value: e.target.value } });
                    handleInputChange({ target: { name: 'nip', value: e.target.value } });
                  }}
                  placeholder="Contoh: 197508242000032001"
                  error={formErrors.nidn}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Program Studi / Fakultas
                </label>
                <Input
                  name="unit_info"
                  value={formData.unit_info}
                  onChange={handleInputChange}
                  placeholder="Contoh: Pendidikan Akuntansi (S1/D4)"
                />
              </div>
            </>
          )}

          {formData.role === ROLES.GURU && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nomor Induk Pegawai (NIP Guru) <span className={styles.required}>*</span>
                </label>
                <Input
                  name="nip"
                  value={formData.nip}
                  onChange={handleInputChange}
                  placeholder="Contoh: 198506122010012023"
                  error={formErrors.nip}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Jurusan / Kompetensi Keahlian SMK
                </label>
                <Input
                  name="unit_info"
                  value={formData.unit_info}
                  onChange={handleInputChange}
                  placeholder="Contoh: Akuntansi & Keuangan Lembaga (AKL)"
                />
              </div>
            </>
          )}

          {formData.role === ROLES.MAHASISWA && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nomor Induk Mahasiswa (NIM) <span className={styles.required}>*</span>
                </label>
                <Input
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  placeholder="Contoh: 2024081001"
                  error={formErrors.nim}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Kelas Perkuliahan / Angkatan
                </label>
                <Input
                  name="unit_info"
                  value={formData.unit_info}
                  onChange={handleInputChange}
                  placeholder="Contoh: Kelas PE 2025 A"
                />
              </div>
            </>
          )}

          {formData.role === ROLES.SISWA && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nomor Induk Siswa Nasional (NISN) <span className={styles.required}>*</span>
                </label>
                <Input
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  placeholder="Contoh: 0081234567"
                  error={formErrors.nisn}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Rombongan Belajar (Kelas SMK)
                </label>
                <Input
                  name="unit_info"
                  value={formData.unit_info}
                  onChange={handleInputChange}
                  placeholder="Contoh: XII AKL 1"
                />
              </div>
            </>
          )}

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              style={{ marginRight: '8px' }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {selectedUser ? 'Simpan Pembaruan' : 'Daftarkan Akun'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;

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
  Check 
} from 'lucide-react';
import styles from './UserManagementPage.module.css';

const UserManagementPage = () => {
  const { isMock } = useAuthStore();
  const { addToast } = useUiStore();
  const { 
    isLoading, 
    fetchUsers, 
    fetchClassesList, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUserManagement();

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, admin, guru, siswa

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // null means adding a new user
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'siswa',
    nisn: '',
    nip: '',
    class_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch initial data
  const loadData = async () => {
    const fetchedUsers = await fetchUsers();
    setUsers(fetchedUsers);
    const fetchedClasses = await fetchClassesList();
    setClasses(fetchedClasses);
  };

  useEffect(() => {
    loadData();
  }, [fetchUsers, fetchClassesList]);

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
        (user.nisn && String(user.nisn).includes(cleanSearch));
      
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchQuery]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormData({
      full_name: '',
      email: '',
      role: 'siswa',
      nisn: '',
      nip: '',
      class_id: classes[0]?.id || ''
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
      role: user.role || 'siswa',
      nisn: user.nisn || '',
      nip: user.nip || '',
      class_id: user.class_id || (classes[0]?.id || '')
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (formData.role === 'siswa') {
      if (!formData.nisn.trim()) {
        errors.nisn = 'NISN wajib diisi untuk Siswa';
      } else if (!/^\d+$/.test(formData.nisn)) {
        errors.nisn = 'NISN hanya boleh berupa angka';
      }
      if (!formData.class_id) {
        errors.class_id = 'Pilihan kelas wajib dipilih';
      }
    } else {
      if (!formData.nip.trim()) {
        errors.nip = 'NIP wajib diisi untuk Guru/Admin';
      } else if (!/^\d+$/.test(formData.nip)) {
        errors.nip = 'NIP hanya boleh berupa angka';
      }
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
      // Toast notification is managed by hook/store
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      key: 'user',
      label: 'Nama & Pengguna',
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
            <span className={styles.userEmail}>{row.email || `${row.role}@epic.school.id`}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Hak Akses (Role)',
      sortable: true,
      render: (row) => {
        let badgeVariant = 'primary';
        let badgeText = 'Siswa SMK';
        if (row.role === 'admin') {
          badgeVariant = 'error';
          badgeText = 'Admin/Kaprog';
        } else if (row.role === 'guru') {
          badgeVariant = 'info';
          badgeText = 'Guru AKL';
        }
        return (
          <Badge variant={badgeVariant} size="sm" glow={row.role === 'admin'}>
            {badgeText}
          </Badge>
        );
      }
    },
    {
      key: 'identity',
      label: 'Nomor Identitas',
      render: (row) => (
        <span className={styles.idText}>
          {row.role === 'siswa' ? `NISN: ${row.nisn || '-'}` : `NIP: ${row.nip || '-'}`}
        </span>
      )
    },
    {
      key: 'class_id',
      label: 'Penempatan Kelas',
      sortable: true,
      render: (row) => {
        if (row.role !== 'siswa') return <span style={{ color: 'var(--text-muted)' }}>-</span>;
        const className = classes.find(c => c.id === row.class_id)?.name || row.class_id || '-';
        return <span className={styles.classText}>{className}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => (
        <div className={styles.actionCell}>
          <button 
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => handleOpenEditModal(row)}
            title="Edit Pengguna"
          >
            <Edit2 size={14} />
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => handleDeleteUser(row)}
            title="Hapus Pengguna"
            disabled={row.id === 'mock-admin-uuid'} // Prevent deleting primary mock admin
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
            variant="epic"
            size="sm"
            onClick={handleOpenAddModal}
            iconLeft={<Plus size={16} />}
          >
            Tambah Pengguna
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Tip / Notification */}
        {isMock && (
          <div className={styles.mockAlert}>
            <Info className={styles.mockIcon} size={18} />
            <div>
              <strong>Simulasi Mode Lokal (Local Preview):</strong> Penambahan, pengeditan, dan penghapusan pengguna di halaman ini disimpan sementara di <code>localStorage</code> dan disinkronisasikan ke roster kelas secara otomatis.
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
                placeholder="Cari nama, email, NIP, NISN..."
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
                className={`${styles.tabBtn} ${activeTab === 'admin' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Admin ({users.filter(u => u.role === 'admin').length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'guru' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('guru')}
              >
                Guru ({users.filter(u => u.role === 'guru').length})
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'siswa' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('siswa')}
              >
                Siswa ({users.filter(u => u.role === 'siswa').length})
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
            emptyStateMessage="Tidak ada pengguna yang cocok dengan filter pencarian Anda."
          />
        </Card>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit Informasi Pengguna' : 'Daftarkan Pengguna Baru'}
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
              placeholder="Contoh: Ahmad Rifai, S.E."
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
              placeholder="Contoh: ahmad@epic.school.id"
              error={formErrors.email}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Hak Akses / Peran <span className={styles.required}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={styles.select}
              disabled={!!selectedUser && selectedUser.id === 'mock-admin-uuid'} // Lock role for primary mock admin
            >
              <option value="siswa">Siswa SMK</option>
              <option value="guru">Guru AKL</option>
              <option value="admin">Admin / Kaprog</option>
            </select>
          </div>

          {/* Dynamic attributes based on selected role */}
          {formData.role === 'siswa' ? (
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
                  Rombongan Belajar (Kelas) <span className={styles.required}>*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {formErrors.class_id && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '4px' }}>
                    {formErrors.class_id}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nomor Induk Pegawai (NIP) <span className={styles.required}>*</span>
              </label>
              <Input
                name="nip"
                value={formData.nip}
                onChange={handleInputChange}
                placeholder="Contoh: 198203112009021003"
                error={formErrors.nip}
              />
            </div>
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
              variant="epic"
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

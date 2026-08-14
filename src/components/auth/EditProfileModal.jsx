import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { capitalizeWords } from '@/utils/formatters';
import { ROLE_LABELS } from '@/utils/constants';
import { processImageUpload } from '@/utils/imageHelper';
import styles from './EditProfileModal.module.css';
import { 
  User, Image, Lock, Upload, Check, Eye, EyeOff, ShieldCheck, Sparkles 
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
];

const EditProfileModal = ({ isOpen, onClose }) => {
  const { profile, updateProfile, updatePassword } = useAuthStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'avatar' | 'security'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    nim: '',
    nisn: '',
    nidn: '',
    nip: '',
    jurusan: '',
    prodi: '',
    kelas: ''
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Sync state when opened
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
        nim: profile.nim || '',
        nisn: profile.nisn || '',
        nidn: profile.nidn || '',
        nip: profile.nip || '',
        jurusan: profile.jurusan || '',
        prodi: profile.prodi || '',
        kelas: profile.kelas || ''
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [profile, isOpen]);

  // Handle local image file upload -> Base64 Data URL (Supports PNG, JPG, WEBP, HEIC, HEIF)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('Ukuran foto maksimal 10 MB', 'error');
        return;
      }
      try {
        addToast('Memproses foto profil...', 'info');
        const res = await processImageUpload(file);
        setFormData(prev => ({ ...prev, avatar_url: res.dataUrl }));
        addToast('Foto profil berhasil diunggah & dikonversi!', 'success');
      } catch (err) {
        addToast(err.message || 'Gagal memproses berkas gambar', 'error');
      }
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!formData.full_name.trim()) {
      addToast('Nama lengkap tidak boleh kosong', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile(formData);
      if (res?.success) {
        addToast('Profil Anda berhasil diperbarui!', 'success');
        onClose();
      } else {
        addToast(res?.error || 'Gagal memperbarui profil', 'error');
      }
    } catch (err) {
      addToast('Terjadi kendala saat menyimpan profil', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async (e) => {
    if (e) e.preventDefault();
    if (!passwordData.newPassword) {
      addToast('Kata sandi baru tidak boleh kosong', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast('Kata sandi baru minimal 6 karakter', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('Konfirmasi kata sandi baru tidak cocok', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      if (res?.success) {
        addToast('Kata sandi berhasil diubah!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onClose();
      } else {
        addToast(res?.error || 'Gagal mengubah kata sandi', 'error');
      }
    } catch (err) {
      addToast('Terjadi kendala saat memperbarui kata sandi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Profil & Akun"
      size="md"
    >
      <div className={styles.modalBody}>
        {/* Navigation Tabs */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Data Diri</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'avatar' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('avatar')}
          >
            <Image size={16} />
            <span>Foto Profil</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={16} />
            <span>Ganti Kata Sandi</span>
          </button>
        </div>

        {/* TAB 1: Profile Information */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input
                  label="Nama Lengkap"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: capitalizeWords(e.target.value) }))}
                  required
                />
              </div>

              <div className={styles.fullWidth}>
                <Input
                  label="Email Akun"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.toLowerCase().trim() }))}
                  disabled
                  helperText="Email utama akun institusi Anda."
                />
              </div>

              {/* Role-specific identifiers */}
              {profile?.role === 'mahasiswa' && (
                <>
                  <Input
                    label="NIM (Nomor Induk Mahasiswa)"
                    value={formData.nim}
                    onChange={(e) => setFormData(prev => ({ ...prev, nim: e.target.value.trim().toUpperCase() }))}
                  />
                  <Input
                    label="Kelas / Rombel"
                    value={formData.kelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, kelas: capitalizeWords(e.target.value) }))}
                  />
                </>
              )}

              {profile?.role === 'siswa' && (
                <>
                  <Input
                    label="NISN (Nomor Induk Siswa Nasional)"
                    value={formData.nisn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nisn: e.target.value.trim() }))}
                  />
                  <Input
                    label="Kelas SMK"
                    value={formData.kelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, kelas: capitalizeWords(e.target.value) }))}
                  />
                </>
              )}

              {profile?.role === 'dosen' && (
                <>
                  <Input
                    label="NIDN"
                    value={formData.nidn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nidn: e.target.value.trim() }))}
                  />
                  <Input
                    label="Program Studi"
                    value={formData.prodi}
                    onChange={(e) => setFormData(prev => ({ ...prev, prodi: capitalizeWords(e.target.value) }))}
                  />
                </>
              )}

              {profile?.role === 'guru' && (
                <>
                  <Input
                    label="NIP"
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value.trim() }))}
                  />
                  <Input
                    label="Kompetensi Keahlian / Jurusan"
                    value={formData.jurusan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jurusan: capitalizeWords(e.target.value) }))}
                  />
                </>
              )}

              {profile?.role === 'admin' && (
                <div className={styles.fullWidth}>
                  <Input
                    label="NIP / ID Administrator"
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value.trim() }))}
                  />
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner size="sm" /> Menyimpan...</> : 'Simpan Profil'}
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: Avatar Photo */}
        {activeTab === 'avatar' && (
          <div>
            <div className={styles.avatarSection}>
              <img
                src={formData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                alt={formData.full_name}
                className={styles.avatarPreview}
              />
              <div className={styles.avatarActions}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Pratinjau Foto Profil
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Gunakan foto preset, masukkan link URL, atau unggah dari perangkat Anda.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    <Upload size={14} /> Unggah Berkas
                    <input type="file" accept="image/*,.heic,.heif,.HEIC,.HEIF" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Pilih Dari Pilihan Avatar:
              </label>
              <div className={styles.presetGrid}>
                {AVATAR_PRESETS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preset ${idx + 1}`}
                    className={`${styles.presetAvatar} ${formData.avatar_url === url ? styles.presetAvatarSelected : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Input
                label="Atau Gunakan URL Gambar Kustom"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              />
            </div>

            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveProfile} disabled={isSubmitting}>
                {isSubmitting ? <><Spinner size="sm" /> Menyimpan...</> : 'Simpan Foto'}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleSavePassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '12px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span>Gunakan minimal 6 karakter kombinasi huruf dan angka untuk keamanan akun Anda.</span>
              </div>

              <Input
                label="Kata Sandi Saat Ini (Opsional)"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi lama"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />

              <Input
                label="Kata Sandi Baru"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />

              <Input
                label="Konfirmasi Kata Sandi Baru"
                type={showPassword ? "text" : "password"}
                placeholder="Ketik ulang kata sandi baru"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--color-primary, #2563eb)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <><EyeOff size={14} /> Sembunyikan Sandi</> : <><Eye size={14} /> Tampilkan Sandi</>}
                </button>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting || !passwordData.newPassword}>
                {isSubmitting ? <><Spinner size="sm" /> Memperbarui...</> : 'Perbarui Kata Sandi'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default EditProfileModal;

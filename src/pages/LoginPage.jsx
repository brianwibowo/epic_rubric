import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import styles from './LoginPage.module.css';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isLoading, isAuthenticated, initializeAuth } = useAuthStore();
  const { addToast } = useUiStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email) {
      setFormError('Surel/Email wajib diisi');
      return;
    }

    try {
      await login(email, password);
      addToast('Masuk sesi berhasil! Selamat datang di EPIC Platform.', 'success');
    } catch (err) {
      setFormError(err.message || 'Gagal masuk sesi');
      addToast(err.message || 'Gagal masuk sesi', 'error');
    }
  };

  // Helper for quick login buttons
  const handleQuickLogin = async (role) => {
    setFormError('');
    try {
      await login(role, 'password');
      addToast(`Masuk sesi sebagai ${role.toUpperCase()} berhasil!`, 'success');
    } catch (err) {
      addToast('Quick login gagal', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      
      <div className={styles.contentWrapper}>
        <div className={styles.logoHeader}>
          <div className={styles.logoIcon}>E</div>
          <h1 className={styles.logoText}>
            EPIC <span className={styles.subLogo}>e-Rubric</span>
          </h1>
          <p className={styles.tagline}>Assessment SaaS for Vocational Accounting Education</p>
        </div>

        <Card variant="glass" padding="lg" className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Masuk Sesi</h2>
            <p className={styles.subtitle}>Gunakan kredensial Anda atau pilih Akun Demo di bawah</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {formError && (
              <div className={`${styles.errorAlert} animate-fade-in`}>
                {formError}
              </div>
            )}
            
            <Input
              label="Surel / Username"
              type="text"
              placeholder="nama@sekolah.sch.id atau 'guru'"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={<Mail size={18} />}
              disabled={isLoading}
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconLeft={<Lock size={18} />}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="epic"
              isLoading={isLoading}
              className={styles.submitBtn}
              iconRight={<LogIn size={18} />}
            >
              Masuk Sesi
            </Button>
          </form>

          <div className={styles.divider}>
            <span>Akses Cepat Demo</span>
          </div>

          <div className={styles.quickLoginSection}>
            <p className={styles.quickLoginHint}>Klik salah satu akun simulasi di bawah:</p>
            <div className={styles.quickLoginButtons}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-error)' }} />
                <span>Admin/Kaprog</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('guru')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Guru AKL</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('siswa')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-success)' }} />
                <span>Siswa SMK</span>
              </Button>
            </div>
          </div>
        </Card>
        
        <div className={styles.footer}>
          © 2026 PT Vuriko Developer Studio. Hak Cipta Dilindungi.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

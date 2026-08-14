import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useLanguageStore } from '@/stores/languageStore';
import styles from './LoginPage.module.css';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Mail, Lock, LogIn, Sparkles, CheckCircle2, ShieldCheck, Award, BookOpen } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isLoading, isAuthenticated, initializeAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const { t } = useLanguageStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  
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
    <div className={styles.splitPage}>
      {/* LEFT HALF: 60% Fullscreen Hero Image + 40% Refined Text */}
      <div className={styles.leftPanel}>
        {/* 60% Top Fullscreen Image Section */}
        <div className={styles.imageTopSection}>
          <img 
            src="/login_illustration.jpg" 
            alt="EPIC Rubric Educational Assessment Illustration" 
            className={styles.fullHeroImg}
          />
          <div className={styles.imageGradientOverlay} />
        </div>

        {/* 40% Bottom Text Section */}
        <div className={styles.textBottomSection}>
          <h2 className={styles.heroHeadline}>
            {t('heroHeadline')}
          </h2>

          <p className={styles.heroSubtext}>
            {t('heroSubtext')}
          </p>

          <div className={styles.featureHighlights}>
            <div className={styles.featurePill}>
              <CheckCircle2 size={14} className={styles.featurePillSvg} />
              <span>{t('feature4Dim')}</span>
            </div>
            <div className={styles.featurePill}>
              <ShieldCheck size={14} className={styles.featurePillSvg} />
              <span>{t('featureAudit')}</span>
            </div>
            <div className={styles.featurePill}>
              <BookOpen size={14} className={styles.featurePillSvg} />
              <span>{t('featureExcel')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: Logo, Language Selector & Login Form */}
      <div className={styles.rightPanel}>
        {/* Language Selector in top right corner */}
        <div className={styles.topLangWrapper}>
          <LanguageSelector />
        </div>

        <div className={styles.formContainer}>
          {/* Logo Section Header */}
          <div className={styles.logoHeaderRight}>
            <img src="/logo.png" alt="EPIC e-Rubric Logo" className={styles.brandLogo} />
            <div>
              <h1 className={styles.brandTitle}>
                EPIC <span className={styles.brandSub}>e-Rubric</span>
              </h1>
              <span className={styles.brandBadge}>{t('appSub')}</span>
            </div>
          </div>

          <div className={styles.cardHeader}>
            <h2 className={styles.title}>{t('loginTitle')}</h2>
            <p className={styles.subtitle}>{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {formError && (
              <div className={`${styles.errorAlert} animate-fade-in`}>
                {formError}
              </div>
            )}
            
            <Input
              label={t('emailLabel')}
              type="text"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={<Mail size={18} />}
              disabled={isLoading}
            />

            <Input
              label={t('passwordLabel')}
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
              {t('loginSubmit')}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>{t('quickDemoTitle')}</span>
          </div>

          <div className={styles.quickLoginSection}>
            <p className={styles.quickLoginHint}>{t('quickDemoHint')}</p>
            <div className={styles.quickLoginButtons}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-error)' }} />
                <span>{t('roleAdmin')}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('dosen')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                <span>{t('roleDosen')}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('guru')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: '#0284c7' }} />
                <span>{t('roleGuru')}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('mahasiswa')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: 'var(--color-success)' }} />
                <span>{t('roleMahasiswa')}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin('siswa')}
                disabled={isLoading}
                className={styles.quickBtn}
              >
                <Sparkles size={14} style={{ color: '#10b981' }} />
                <span>{t('roleSiswa')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

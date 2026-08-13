import React from 'react';
import Card from '@/components/ui/Card';
import { BookOpen, PlusCircle, Users, ArrowRight, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import HelpButton from '@/components/ui/HelpButton';
import { useNavigate } from 'react-router-dom';
import styles from './MataKuliahListPage.module.css';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useTourStore } from '@/stores/tourStore';
import { ROLES, MK_STATUS_LABELS } from '@/utils/constants';

import { useLanguageStore } from '@/stores/languageStore';

const TranslatedText = ({ text }) => {
  const { lang, translateDynamic } = useLanguageStore();
  const [translated, setTranslated] = React.useState(text);

  React.useEffect(() => {
    let isMounted = true;
    if (lang === 'en') {
      translateDynamic(text, 'en').then(res => {
        if (isMounted) setTranslated(res);
      });
    } else {
      setTranslated(text);
    }
    return () => { isMounted = false; };
  }, [text, lang, translateDynamic]);

  return <>{translated}</>;
};

const MataKuliahListPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList } = useMKStore();
  const { t } = useLanguageStore();

  const isDosen = profile?.role === ROLES.DOSEN || profile?.role === ROLES.ADMIN;
  const isMhs = profile?.role === ROLES.MAHASISWA;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>{t('mkListTitle')}</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {isDosen ? t('mkListSubtitleDosen') : t('mkListSubtitleMhs')}
          </p>
        </div>

        {isDosen && (
          <Button variant="primary" onClick={() => navigate('/mk/create')}>
            <PlusCircle size={18} /> {t('btnCreateMK')}
          </Button>
        )}
      </div>

      {mkList.length > 0 ? (
        <div className={styles.grid}>
          {mkList.map((mk) => (
            <div 
              key={mk.id} 
              className={styles.mkCard}
              onClick={() => navigate(isMhs ? `/mk/${mk.id}/analytics` : `/mk/${mk.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(isMhs ? `/mk/${mk.id}/analytics` : `/mk/${mk.id}`)}
              role="button"
              tabIndex={0}
            >
              {/* Top Colored Accent Strip */}
              <div className={styles.cardAccentBar} />

              <div className={styles.mkCardBody}>
                <div className={styles.mkCardHeader}>
                  <div className={styles.mkIconBox}>
                    <BookOpen size={20} />
                  </div>
                </div>
                
                <h3 className={styles.mkName}>
                  <TranslatedText text={mk.name} />
                </h3>

                {/* Metadata Chips Layout */}
                <div className={styles.metaChipsGroup}>
                  <span className={styles.metaChip}>
                    <Layers size={13} />
                    {mk.kode_mk}{mk.sks ? ` • ${mk.sks} ${t('sksLabel')}` : ''}
                  </span>
                  <span className={styles.metaChipSubtle}>
                    {mk.semester}{mk.kode_semester ? ` (${mk.kode_semester})` : ''}
                  </span>
                  {mk.kelas && (
                    <span className={styles.metaChipSubtle}>
                      {t('classLabel')} {mk.kelas}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.mkFooter}>
                <div className={styles.footerLeft}>
                  <Users size={14} className={styles.studentIcon} />
                  <span className={styles.studentCount}>
                    {mk.students ? mk.students.length : 0} {t('studentCount')}
                  </span>
                </div>

                <div className={styles.footerRight}>
                  {isDosen && mk.join_code && (
                    <div className={styles.joinCodePill} title="Kode MK">
                      <span className={styles.joinCodeLabel}>{t('codeLabel')}:</span>
                      <strong className={styles.joinCodeValue}>{mk.join_code}</strong>
                    </div>
                  )}
                  <div className={styles.arrowCircle}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '20px' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
            {t('noMKTitle')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {isDosen ? t('noMKDescDosen') : t('noMKDescMhs')}
          </p>
          {isDosen && (
            <Button variant="primary" onClick={() => navigate('/mk/create')}>
              <PlusCircle size={18} /> {t('btnCreateMKFirst')}
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default MataKuliahListPage;

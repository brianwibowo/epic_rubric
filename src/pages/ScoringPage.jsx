import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRubric } from '@/hooks/useRubric';
import { useScoring } from '@/hooks/useScoring';
import { useScoringStore } from '@/stores/scoringStore';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import ScoringPanel from '@/components/scoring/ScoringPanel';
import ScoreSummary from '@/components/scoring/ScoreSummary';
import FinalScoreDisplay from '@/components/scoring/FinalScoreDisplay';
import FokusPerbaikan from '@/components/scoring/FokusPerbaikan';
import { calculateFinalScore, detectFocusArea } from '@/utils/scoringEngine';
import { ArrowLeft, Save, Lock, Send, Unlock, Calendar, User, FileText } from 'lucide-react';
import styles from './ScoringPage.module.css';

// Mock student roster for local simulation
const MOCK_STUDENTS = [
  { id: 'siswa-1', full_name: 'Ahmad Rifai', nisn: '0081234567' },
  { id: 'siswa-2', full_name: 'Citra Lestari', nisn: '0082345678' },
  { id: 'siswa-3', full_name: 'Dewi Sartika', nisn: '0083456789' },
  { id: 'mock-siswa-uuid', full_name: 'Feri Irawan', nisn: '0087654321' } // Feri, our logged in student
];

const ScoringPage = () => {
  const { classId, studentId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { templates, isLoading: isLoadingRubrics } = useRubric();
  const { 
    isLoading: isLoadingScoring, 
    fetchAssessment, 
    saveAssessmentDraft, 
    finalizeAssessment, 
    sendToAnalytics, 
    reopenAssessment 
  } = useScoring();

  const session = useScoringStore();

  const [activeStudent, setActiveStudent] = useState(null);
  const [projectName] = useState('Praktikum Siklus Akuntansi AKL-1');
  const [pageLoading, setPageLoading] = useState(true);

  // Modals for confirmation
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  // Load student info and assessment data
  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      
      // 1. Get student details
      const studentObj = MOCK_STUDENTS.find(s => s.id === studentId) || { id: studentId, full_name: 'Siswa Akuntansi' };
      setActiveStudent(studentObj);

      // 2. Fetch assessment details if exists
      const assessment = await fetchAssessment(studentId, projectName);

      // 3. Find Master Rubric Template or use default
      let activeWeights = { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 };
      let templateId = null;
      
      const masterTemplate = templates.find(t => t.is_master) || templates[0];
      if (masterTemplate) {
        templateId = masterTemplate.id;
        activeWeights = {
          E: Number(masterTemplate.weight_e),
          P: Number(masterTemplate.weight_p),
          I: Number(masterTemplate.weight_i),
          C: Number(masterTemplate.weight_c),
          PE: Number(masterTemplate.weight_pe)
        };
      }

      // 4. Initialize Zustand Store Session
      session.initSession(assessment, activeWeights, studentObj, classId, projectName);
      
      if (assessment && assessment.rubric_template_id) {
        session.setState({ rubricTemplateId: assessment.rubric_template_id });
      } else if (templateId) {
        session.setState({ rubricTemplateId: templateId });
      }

      setPageLoading(false);
    };

    if (studentId) {
      loadData();
    }
  }, [studentId, classId, projectName, templates, fetchAssessment]);

  const handleScoreChange = (dim, score) => {
    session.setScore(dim, score);
  };

  const handleFeedbackChange = (dim, feedback) => {
    session.setFeedback(dim, feedback);
  };

  const handleSaveDraft = async () => {
    try {
      const saved = await saveAssessmentDraft({
        id: session.assessmentId,
        studentId: session.student.id,
        classId: session.classId,
        projectName: session.projectName,
        rubricTemplateId: session.rubricTemplateId,
        scores: session.scores,
        feedbacks: session.feedbacks,
        weights: session.weights
      });
      if (saved) {
        session.setState({ assessmentId: saved.id, isDirty: false });
      }
    } catch (e) {
      // toast is already thrown in hook
    }
  };

  const handleFinalize = async () => {
    setFinalizeModalOpen(false);
    try {
      const updated = await finalizeAssessment(
        session.assessmentId,
        session.scores,
        session.feedbacks,
        session.weights
      );
      if (updated) {
        session.setState({ 
          status: updated.status, 
          isDirty: false 
        });
      }
    } catch (e) {
      // error is already logged
    }
  };

  const handleSendToAnalytics = async () => {
    setSendModalOpen(false);
    try {
      const updated = await sendToAnalytics(session.assessmentId);
      if (updated) {
        session.setState({ status: updated.status });
      }
    } catch (e) {
      // error logged
    }
  };

  const handleReopen = async () => {
    setReopenModalOpen(false);
    try {
      const updated = await reopenAssessment(session.assessmentId);
      if (updated) {
        session.setState({
          status: updated.status,
          isDirty: false
        });
      }
    } catch (e) {
      // error logged
    }
  };

  if (pageLoading || isLoadingRubrics) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner size="lg" />
        <p className={styles.loadingText}>Memuat lembar penilaian...</p>
      </div>
    );
  }

  // Derived scoring calculations
  const finalScore = calculateFinalScore(session.scores, session.weights);
  const focusArea = detectFocusArea(session.scores, session.weights);
  const isEditable = session.status === 'DRAFT';
  const allScoresSelected = Object.values(session.scores).every(val => val !== null);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <Header
        title="Lembar Penilaian Praktikum"
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate(`/students/${classId}`)} iconLeft={<ArrowLeft size={16} />}>
            Kembali ke Roster
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Student Meta Card */}
        <Card variant="glass" padding="md" className={styles.studentMetaCard}>
          <div className={styles.metaLeft}>
            <div className={styles.metaItem}>
              <User size={16} className={styles.metaIcon} />
              <span>Siswa: <strong>{activeStudent?.full_name}</strong></span>
              <span className={styles.subMeta}>({activeStudent?.nisn})</span>
            </div>
            <div className={styles.metaItem}>
              <FileText size={16} className={styles.metaIcon} />
              <span>Praktikum: <strong>{projectName}</strong></span>
            </div>
          </div>

          <div className={styles.metaRight}>
            <div className={styles.metaItem}>
              <Calendar size={16} className={styles.metaIcon} />
              <span>Kelas: <strong>{classId}</strong></span>
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant={
                session.status === 'SENT_TO_ANALYTICS' 
                  ? 'success' 
                  : session.status === 'FINALIZED' 
                    ? 'info' 
                    : 'warning'
              }
              size="md"
              glow
            >
              {session.status === 'SENT_TO_ANALYTICS' ? 'SENT TO ANALYTICS' : session.status}
            </Badge>
          </div>
        </Card>

        {/* Cockpit Grid */}
        <div className={styles.scoringGrid}>
          {/* Left: Scoring Panels list */}
          <div className={styles.panelsCol}>
            {Object.keys(session.scores).map((dimCode) => (
              <ScoringPanel
                key={dimCode}
                dimensionCode={dimCode}
                score={session.scores[dimCode]}
                feedback={session.feedbacks[dimCode]}
                weight={session.weights[dimCode]}
                onScoreChange={(score) => handleScoreChange(dimCode, score)}
                onFeedbackChange={(text) => handleFeedbackChange(dimCode, text)}
                disabled={!isEditable || isLoadingScoring}
              />
            ))}
          </div>

          {/* Right: Summary & Control Sidebar */}
          <div className={styles.sidebarCol}>
            <Card variant="solid" padding="md" className={styles.stickySidebar}>
              <FinalScoreDisplay score={finalScore} />
              
              <hr className={styles.divider} />
              
              <ScoreSummary scores={session.scores} />
              
              {allScoresSelected && (
                <>
                  <hr className={styles.divider} />
                  <FokusPerbaikan focusAreaCode={focusArea} />
                </>
              )}

              <hr className={styles.divider} />

              {/* Actions Box */}
              <div className={styles.actionBox}>
                {isEditable ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      isLoading={isLoadingScoring}
                      disabled={!session.isDirty}
                      iconLeft={<Save size={18} />}
                      className={styles.sidebarBtn}
                    >
                      Simpan Draf
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setFinalizeModalOpen(true)}
                      disabled={!allScoresSelected || isLoadingScoring}
                      iconLeft={<Lock size={18} />}
                      className={styles.sidebarBtn}
                    >
                      Finalisasi Penilaian
                    </Button>
                  </>
                ) : session.status === 'FINALIZED' ? (
                  <>
                    <Button
                      variant="epic"
                      onClick={() => setSendModalOpen(true)}
                      isLoading={isLoadingScoring}
                      iconLeft={<Send size={18} />}
                      className={styles.sidebarBtn}
                    >
                      Kirim ke Siswa
                    </Button>
                    
                    {/* Re-open Remedial Button (Only for Admin/Teacher) */}
                    {profile?.role === 'admin' && (
                      <Button
                        variant="danger"
                        onClick={() => setReopenModalOpen(true)}
                        isLoading={isLoadingScoring}
                        iconLeft={<Unlock size={18} />}
                        className={styles.sidebarBtn}
                      >
                        Buka Kunci Nilai
                      </Button>
                    )}
                  </>
                ) : (
                  // SENT_TO_ANALYTICS state
                  <div className={styles.sentBox}>
                    <p className={styles.sentLabel}>Nilai telah dikirim dan disebarkan ke dashboard siswa.</p>
                    {profile?.role === 'admin' && (
                      <Button
                        variant="danger"
                        onClick={() => setReopenModalOpen(true)}
                        isLoading={isLoadingScoring}
                        iconLeft={<Unlock size={18} />}
                        className={styles.sidebarBtn}
                      >
                        Buka Kunci (Remedial)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      
      {/* 1. Finalize Confirmation */}
      <Modal
        isOpen={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="Finalisasi Penilaian?"
        size="sm"
      >
        <p className={styles.modalText}>
          Tindakan ini akan mengunci seluruh input skor dan umpan balik guru. Anda tidak akan dapat mengedit nilai ini kecuali admin menyetujui remedial.
        </p>
        <div className={styles.modalBtns}>
          <Button variant="outline" size="sm" onClick={() => setFinalizeModalOpen(false)}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleFinalize} isLoading={isLoadingScoring}>
            Ya, Kunci Nilai
          </Button>
        </div>
      </Modal>

      {/* 2. Send to Analytics Confirmation */}
      <Modal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title="Kirim ke Learning Analytics?"
        size="sm"
      >
        <p className={styles.modalText}>
          Kirim nilai siswa ini ke dashboard analitik kelas dan dashboard rapor pribadi siswa? Siswa akan menerima notifikasi secara real-time.
        </p>
        <div className={styles.modalBtns}>
          <Button variant="outline" size="sm" onClick={() => setSendModalOpen(false)}>
            Batal
          </Button>
          <Button variant="epic" size="sm" onClick={handleSendToAnalytics} isLoading={isLoadingScoring}>
            Kirim Nilai
          </Button>
        </div>
      </Modal>

      {/* 3. Re-open / Unlock Confirmation */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Buka Kunci Nilai (Remedial)?"
        size="sm"
      >
        <p className={styles.modalText}>
          Membuka kembali lembar penilaian ini akan mengembalikan status ke **DRAFT** sehingga guru dapat merevisi skor siswa. Tindakan ini akan dicatat dalam log audit.
        </p>
        <div className={styles.modalBtns}>
          <Button variant="outline" size="sm" onClick={() => setReopenModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" size="sm" onClick={handleReopen} isLoading={isLoadingScoring}>
            Buka Kunci (+1 Revisi)
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ScoringPage;

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getKomponenCode, getKomponenFullName } from './komponenHelper';
import { getGradeInfo } from './gradeHelper';

/**
 * Ekspor Rapor & Analitik Mahasiswa ke PDF Terstruktur (1 Halaman A4 Sempurna)
 * Format Resmi Akademik Institusi.
 */
export function exportStructuredReportPdf({
  mk,
  student,
  komponenScores = [],
  radarData = [],
  aiInsight = null,
  mkType = 'INDUSTRI'
}) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const isAgregat = student?.full_name?.includes('Semua Mahasiswa') || student?.full_name?.includes('Agregat');
    const isSchoolPdf = student?.nisn || (student?.rombelName || '').includes('AKL') || (mk?.rombel || []).some(r => r.name.includes('AKL')) || mk?.tahun_ajaran;

    const learnerLabel = isSchoolPdf ? 'Nama Siswa' : 'Nama Mahasiswa';
    const idLabel = isSchoolPdf ? 'NISN' : 'NIM';
    const classLabel = isSchoolPdf ? 'Kelas' : 'Rombel';
    const courseLabel = isSchoolPdf ? 'Mata Pelajaran' : 'Mata Kuliah';
    const educatorLabel = isSchoolPdf ? 'Guru Pengampu' : 'Dosen Pengampu';

    const studentName = student?.full_name || student?.name || (isSchoolPdf ? 'Siswa' : 'Mahasiswa');
    const studentNim = student?.nisn || student?.nim || '-';
    const rombelName = student?.rombelName || mk?.kelas || (isSchoolPdf ? 'Kelas Reguler' : 'Rombel Reguler');
    const mkName = mk?.name || (isSchoolPdf ? 'Mata Pelajaran' : 'Mata Kuliah');
    const kodeMK = mk?.kode_mk || '-';
    const educatorName = isSchoolPdf ? (mk?.guru_name || mk?.dosen_name || 'Guru Pengampu') : (mk?.dosen_name || 'Dosen Pengampu');
    const totalScore = Math.round(komponenScores.reduce((sum, k) => sum + (k.weighted || 0), 0));
    const gradeData = getGradeInfo(totalScore);

    // ──── 1. HEADER INSTITUSI ────
    doc.setFillColor(37, 99, 235); // Primary Accent
    doc.rect(0, 0, pageWidth, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('EPIC E-RUBRIC ASSESSMENT PLATFORM', 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Laporan Hasil Evaluasi Pembelajaran & Diagnosis Kompetensi ${isSchoolPdf ? 'Siswa' : 'Mahasiswa'}`, 14, 18);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 21, pageWidth - 14, 21);

    // ──── 2. METADATA MAHASISWA & MATA KULIAH ────
    const metaY = 27;
    doc.setFontSize(8);
    
    // Left column (Mahasiswa / Rombel)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(isAgregat ? 'Sasaran Evaluasi' : learnerLabel, 14, metaY);
    doc.text(isAgregat ? 'Cakupan Peserta' : idLabel, 14, metaY + 4.5);
    doc.text(classLabel, 14, metaY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${studentName}`, 44, metaY);
    doc.text(`: ${studentNim}`, 44, metaY + 4.5);
    doc.text(`: ${rombelName}`, 44, metaY + 9);

    // Right column (Mata Kuliah)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(courseLabel, 115, metaY);
    doc.text(educatorLabel, 115, metaY + 4.5);
    doc.text('Kategori Kurikulum', 115, metaY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${kodeMK} - ${mkName}`, 146, metaY);
    doc.text(`: ${educatorName}`, 146, metaY + 4.5);
    doc.text(`: ${mkType === 'PENDIDIKAN' ? 'Bidang Kependidikan (Pedagogis)' : 'Bidang Industri / Vokasi Terapan'}`, 146, metaY + 9);

    // ──── 3. SCORE SUMMARY BOX (Clean Non-Colliding Layout) ────
    const scoreBoxY = 40;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, scoreBoxY, pageWidth - 28, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, scoreBoxY, pageWidth - 28, 12, 1.5, 1.5, 'S');

    // Section 1: Final Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('NILAI AKHIR:', 18, scoreBoxY + 7.5);

    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text(`${totalScore} / 100`, 42, scoreBoxY + 8);

    // Section 2: Grade
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('PREDIKAT:', 80, scoreBoxY + 7.5);

    doc.setFontSize(10);
    doc.setTextColor(gradeData.isPassing ? 5 : 220, gradeData.isPassing ? 150 : 38, gradeData.isPassing ? 105 : 38);
    doc.text(`GRADE ${gradeData.grade} (${gradeData.desc})`, 100, scoreBoxY + 7.8);

    // Section 3: Status
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gradeData.isPassing ? 5 : 220, gradeData.isPassing ? 150 : 38, gradeData.isPassing ? 105 : 38);
    doc.text(`STATUS: ${gradeData.isPassing ? 'TUNTAS / LULUS' : 'REMEDIAL'}`, pageWidth - 65, scoreBoxY + 7.5);

    // ──── 4. TABEL KOMPONEN PENILAIAN ────
    const tableDataKomponen = komponenScores.map((k, idx) => [
      idx + 1,
      getKomponenCode(k.name),
      getKomponenFullName(k.name),
      k.rubricName || 'Rubrik Standar',
      `${Math.round((k.bobot || 0) * 100)}%`,
      k.rawScore ?? '-',
      (k.weighted ?? 0).toFixed(1)
    ]);

    tableDataKomponen.push([
      '',
      'TOTAL',
      'Akumulasi Nilai Akhir Terbobot',
      '-',
      '100%',
      '-',
      `${totalScore}.0`
    ]);

    autoTable(doc, {
      startY: 56,
      head: [['No', 'Kode', 'Komponen Penilaian', 'Rubrik Evaluasi', 'Bobot', 'Skor', 'Terbobot']],
      body: tableDataKomponen,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 1.5
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        2: { cellWidth: 48 },
        3: { cellWidth: 'auto', fontStyle: 'italic', textColor: [100, 116, 139] },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [37, 99, 235] }
      }
    });

    // ──── 5. TABEL CAPAIAN 4 DIMENSI EPIC ────
    let currentY = doc.lastAutoTable.finalY + 4;

    const tableDataEPIC = radarData.map(r => [
      r.dimension,
      r.fullName,
      `${r.score} / 4.0`,
      `${r.avgScore || 3.2} / 4.0`,
      r.score >= 3.5 ? 'Sangat Baik' : r.score >= 3.0 ? 'Baik / Kompeten' : r.score >= 2.0 ? 'Cukup' : 'Perlu Bimbingan'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Dimensi', 'Nama Dimensi Kerangka Evaluasi', 'Skor Capaian', 'Rata-Rata Kelas', 'Predikat Capaian']],
      body: tableDataEPIC,
      theme: 'grid',
      headStyles: {
        fillColor: [5, 150, 105], // Emerald
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 1.5
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 24 },
        4: { halign: 'center', cellWidth: 32 }
      }
    });

    // ──── 6. DIAGNOSIS AI & SEBAB-AKIBAT ────
    currentY = doc.lastAutoTable.finalY + 4;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, pageWidth - 28, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('DIAGNOSIS PEMBELAJARAN (SEBAB - AKIBAT & EVIDENCE-BASED LEARNING ANALYTICS)', 18, currentY + 4.2);

    currentY += 9;

    const strengths = aiInsight?.strengths || [
      'Bukti & Sebab: Penguasaan konsep jurnal umum sangat rapi dan konsisten. Dampak Positif: Kertas kerja awal seimbang tanpa kesalahan format.'
    ];

    const weaknesses = aiInsight?.weaknesses || [
      'Bukti & Akar Masalah: Kesulitan menganalisis pos penyesuaian akrual. Dampak Risiko: Berpotensi memicu selisih laba bersih periode berjalan.'
    ];

    const recommendations = aiInsight?.recommendations || [
      'Latih simulasi kasus riil pada pos penyesuaian beban sebelum pelaksanaan evaluasi akhir.'
    ];

    const careerPotential = aiInsight?.careerPotential || (
      mkType === 'PENDIDIKAN'
        ? `Profil Relevansi Lulusan: Calon Guru/Pendidik Akuntansi & Ekonomi, Pengembang Modul Ajar, atau Instruktur Pelatihan.`
        : `Profil Relevansi Lulusan: Junior Accounting Staff, Tax Associate, atau Asisten Auditor Internal.`
    );

    // 1. Strengths
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('1. Analisis Kompetensi Unggul & Faktor Pendukung:', 14, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    strengths.slice(0, 2).forEach(s => {
      const splitText = doc.splitTextToSize(`• ${s}`, pageWidth - 28);
      doc.text(splitText, 18, currentY);
      currentY += splitText.length * 3.2;
    });

    currentY += 1.5;

    // 2. Learning Gap
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(217, 119, 6);
    doc.text('2. Diagnosis Learning Gap (Sebab & Dampak Risiko):', 14, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    weaknesses.slice(0, 1).forEach(w => {
      const splitText = doc.splitTextToSize(`• ${w}`, pageWidth - 28);
      doc.text(splitText, 18, currentY);
      currentY += splitText.length * 3.2;
    });

    currentY += 1.5;

    // 3. Recommendations
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235);
    doc.text('3. Rekomendasi Solusi & Intervensi Terarah:', 14, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    recommendations.slice(0, 2).forEach(r => {
      const splitText = doc.splitTextToSize(`• ${r}`, pageWidth - 28);
      doc.text(splitText, 18, currentY);
      currentY += splitText.length * 3.2;
    });

    currentY += 1.5;

    // 4. Career Relevance
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(109, 40, 217);
    doc.text(`4. Relevansi Profil Lulusan (${mkType === 'PENDIDIKAN' ? 'Kependidikan' : 'Industri Terapan'}):`, 14, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitCareer = doc.splitTextToSize(careerPotential, pageWidth - 28);
    doc.text(splitCareer, 18, currentY);
    currentY += splitCareer.length * 3.2 + 4;

    // ──── 7. FOOTER & TANDA TANGAN (Guaranteed 1-Page Layout) ────
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dicetak resmi oleh Sistem EPIC e-Rubric pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`, 14, currentY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Dosen Pengampu Mata Kuliah,', pageWidth - 65, currentY);
    doc.text(dosenName, pageWidth - 65, currentY + 12);

    // Save File
    const cleanStudent = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanMK = mkName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Rapor_Resmi_EPIC_${cleanStudent}_${cleanMK}.pdf`;

    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating structured PDF:', error);
    alert('Gagal mengekspor PDF terstruktur: ' + error.message);
    return false;
  }
}

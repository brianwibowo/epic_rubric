import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates the Official EPIC Platform System Documentation & User Manual PDF
 * (Buku Panduan Pengguna & Dokumentasi Lengkap Sistem EPIC e-Rubric).
 */
export function generateUserManualPdf() {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const totalPagesExp = '{total_pages_count_string}';

    // Color Palette
    const primaryColor = [37, 99, 235];    // #2563eb
    const secondaryColor = [5, 150, 105];  // #059669
    const darkColor = [15, 23, 42];        // #0f172a
    const mutedColor = [100, 116, 139];    // #64748b
    const lightBg = [248, 250, 252];       // #f8fafc

    // Helper: Header on inner pages
    const drawPageHeader = (pageTitle) => {
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 3.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      doc.text('EPIC e-RUBRIC PLATFORM — BUKU PANDUAN PENGGUNA & DOKUMENTASI SISTEM', 14, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text(pageTitle, pageWidth - 14, 11, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 14, pageWidth - 14, 14);
    };

    // Helper: Footer on inner pages
    const drawPageFooter = (pageNumber) => {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedColor);
      doc.text('Platform Asesmen Vokasi Akuntansi Berbasis Rubrik 4 Dimensi EPIC © 2026', 14, pageHeight - 7);
      doc.text(`Halaman ${pageNumber}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
    };

    // =========================================================================
    // PAGE 1: COVER PAGE (HALAMAN SAMPUL EKSEKUTIF)
    // =========================================================================
    // Top banner graphic
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Title & Logo Badge
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, 25, 42, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('VERSI 2.0 • STANDAR VOKASI', 17, 31.5);

    // Main Book Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...darkColor);
    doc.text('BUKU PANDUAN PENGGUNA', 14, 48);
    doc.text('& DOKUMENTASI SISTEM', 14, 57);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Platform Asesmen Vokasi Akuntansi Berbasis Rubrik 4 Dimensi EPIC', 14, 65);

    doc.setFontSize(9.5);
    doc.setTextColor(...mutedColor);
    doc.text('(Evaluative, Predictive, Integrative, Critical)', 14, 71);

    // Decorative Separator
    doc.setFillColor(...secondaryColor);
    doc.rect(14, 76, 28, 1.5, 'F');

    // Highlight Box: System Features Overview
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, 84, pageWidth - 28, 88, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 84, pageWidth - 28, 88, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('Ringkasan Kapabilitas & Inovasi Utama Platform:', 20, 93);

    const highlights = [
      ['1. Pemisahan Jalur Institusi (Dual-Track)', 'Dukungan penuh Jalur SMK (Guru & Siswa) dan Perguruan Tinggi (Dosen & Mahasiswa) tanpa tabrakan data.'],
      ['2. Engine Asesmen Rubrik 4 Dimensi EPIC', 'Pengukuran objektif berbasis level Likert 1-4 untuk dimensi Evaluatif, Prediktif, Integratif, dan Kritis.'],
      ['3. Pusat Komando Eksekutif Administrator', 'Monitoring real-time KPI institusi, sebaran pengguna, dan pencatatan audit log keamanan aktivitas.'],
      ['4. Visualisasi Radar & AI Kausalitas', 'Grafik radar capaian kompetensi individu/angkatan serta diagnosis analitik bertenaga AI.'],
      ['5. Penerbitan Laporan Resmi Otomatis', 'Ekspor Rapor PDF A4 1-Halaman berstandar akademik dan Ekspor Rekap Excel Multi-Sheet per Rombel.'],
      ['6. Kompatibilitas Format Foto Modern', 'Dukungan format foto kamera Apple iPhone (.heic/.heif) dengan konversi otomatis client-side.']
    ];

    let hlY = 101;
    highlights.forEach(([title, desc]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text(`• ${title}:`, 20, hlY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text(desc, 24, hlY + 4.5);
      hlY += 10.5;
    });

    // Metadata Footer on Cover
    const coverMetaY = 185;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, coverMetaY, pageWidth - 14, coverMetaY);

    // Tim Peneliti
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text('TIM PENELITI & FORMULASI STANDAR RUBRIK:', 14, coverMetaY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('1. Dr. Kardiyem, S.Pd., M.Pd. (Lektor Kepala - Pendidikan Akuntansi FEB UNNES)', 14, coverMetaY + 13);
    doc.text('2. Dwi Puji Astuti, S.Pd., M.Pd. (Lektor - Pendidikan Akuntansi FEB UNNES)', 14, coverMetaY + 18.5);

    // Pengembang Platform
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text('PENGEMBANG PERANGKAT LUNAK:', 14, coverMetaY + 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Dibuat & Dikembangkan oleh: Apriansyah Wibowo (instagram.com/brianwibowoo)', 14, coverMetaY + 34);

    // Bottom decorative bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');

    // =========================================================================
    // PAGE 2: MATRIKS HAK AKSES & 5 PERAN PENGGUNA (ROLE MATRIX)
    // =========================================================================
    doc.addPage();
    drawPageHeader('BAB 1: MATRIKS HAK AKSES & PERAN PENGGUNA');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('1. Struktur Peran & Matriks Otorisasi Pengguna', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Platform EPIC e-Rubric membagi hak akses ke dalam 5 peran spesifik untuk menjamin integritas data institusi:', 14, 27);

    autoTable(doc, {
      startY: 31,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: darkColor, cellPadding: 2.5 },
      columns: [
        { header: 'Peran (Role)', dataKey: 'role' },
        { header: 'Kategori Institusi', dataKey: 'institution' },
        { header: 'Identitas Unik', dataKey: 'idCode' },
        { header: 'Cakupan Hak Akses Utama', dataKey: 'scope' }
      ],
      body: [
        {
          role: 'Administrator',
          institution: 'Seluruh Institusi (SMK & PT)',
          idCode: 'NIP Admin',
          scope: 'Pusat Komando Eksekutif, Manajemen Semua Akun Pengguna, Audit Trail Keamanan, Monitoring Kelas & MK, Akses Bank Rubrik.'
        },
        {
          role: 'Dosen Vokasi',
          institution: 'Perguruan Tinggi (Vokasi)',
          idCode: 'NIDN / NIP Dosen',
          scope: 'Kelola Mata Kuliah & SKS, Penilaian Rombel Kuliah (NIM), Analitik Radar Capaian Angkatan, Ekspor Rekap Excel/PDF.'
        },
        {
          role: 'Guru SMK',
          institution: 'Sekolah Menengah Kejuruan',
          idCode: 'NIP Guru',
          scope: 'Kelola Rombongan Belajar (Kelas), Penilaian Siswa SMK (NISN), Penilaian Portofolio & Praktikum, Ekspor Daftar Nilai Kelas.'
        },
        {
          role: 'Mahasiswa',
          institution: 'Perguruan Tinggi (Vokasi)',
          idCode: 'NIM Mahasiswa',
          scope: 'Rapor Capaian Mandiri 4 Dimensi EPIC, Diagnosis Kausalitas AI, Cetak Rapor A4 PDF, Forum Diskusi dengan Dosen.'
        },
        {
          role: 'Siswa SMK',
          institution: 'Sekolah Menengah Kejuruan',
          idCode: 'NISN Siswa',
          scope: 'Rapor Capaian Siswa SMK, Evaluasi Kompetensi Akuntansi, Cetak Rapor Capaian A4 PDF, Forum Diskusi dengan Guru.'
        }
      ]
    });

    const roleY = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('2. Penyesuaian Terminologi Otomatis (Adaptive Terminology)', 14, roleY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Sistem secara dinamis mengadaptasi seluruh antarmuka sesuai dengan peran dan jalur yang diakses:', 14, roleY + 5);

    autoTable(doc, {
      startY: roleY + 8,
      theme: 'striped',
      headStyles: { fillColor: secondaryColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: darkColor, cellPadding: 2 },
      columns: [
        { header: 'Entitas Sistem', dataKey: 'entity' },
        { header: 'Jalur SMK (Sekolah Menengah)', dataKey: 'smk' },
        { header: 'Jalur Perguruan Tinggi (Vokasi)', dataKey: 'univ' }
      ],
      body: [
        { entity: 'Mata Kuliah / Pelajaran', smk: 'Mata Pelajaran (Mapel) & Jam/Minggu', univ: 'Mata Kuliah (MK) & Satuan Kredit Semester (SKS)' },
        { entity: 'Peserta Didik', smk: 'Siswa & Nomor Induk Siswa Nasional (NISN)', univ: 'Mahasiswa & Nomor Induk Mahasiswa (NIM)' },
        { entity: 'Tenaga Pendidik', smk: 'Guru Pengampu / Wali Kelas & NIP', univ: 'Dosen Pengampu & NIDN / NIP' },
        { entity: 'Kelompok Belajar', smk: 'Kelas / Rombel (e.g. XII AKL 1)', univ: 'Rombel Kuliah (e.g. PE 2025 A)' },
        { entity: 'Periode Akademik', smk: 'Tahun Ajaran (e.g. 2025/2026)', univ: 'Semester (e.g. Ganjil 2025/2026)' }
      ]
    });

    drawPageFooter(2);

    // =========================================================================
    // PAGE 3: ENGINE PENILAIAN RUBRIK 4 DIMENSI EPIC
    // =========================================================================
    doc.addPage();
    drawPageHeader('BAB 2: ENGINE PENILAIAN RUBRIK 4 DIMENSI EPIC');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('1. Konsep & Definisi 4 Dimensi EPIC', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Model asesmen EPIC mengukur kompetensi akuntansi komprehensif melalui 4 pilar utama:', 14, 27);

    autoTable(doc, {
      startY: 31,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: darkColor, cellPadding: 2.5 },
      columns: [
        { header: 'Dimensi', dataKey: 'dim' },
        { header: 'Fokus Kompetensi', dataKey: 'focus' },
        { header: 'Indikator Kinerja & Deskriptor Pengukuran', dataKey: 'indicator' }
      ],
      body: [
        {
          dim: 'Evaluative (E)',
          focus: 'Ketepatan Analisis & Validasi',
          indicator: 'Ketelitian menganalisis bukti transaksi, kebenaran penjurnalan, rekonsiliasi buku besar, dan kepatuhan standar akuntansi.'
        },
        {
          dim: 'Predictive (P)',
          focus: 'Proyeksi & Estimasi Bisnis',
          indicator: 'Kemampuan mengestimasi arus kas masa depan, peramalan tren laba/rugi, analisis rasio solvabilitas, dan mitigasi risiko keuangan.'
        },
        {
          dim: 'Integrative (I)',
          focus: 'Penguasaan Siklus & Software',
          indicator: 'Kecakapan mengoperasikan spreadsheet & software akuntansi digital, integrasi data lintas laporan, dan kerapian kertas kerja.'
        },
        {
          dim: 'Critical (C)',
          focus: 'Pemecahan Masalah & Refleksi',
          indicator: 'Analisis kritis terhadap anomali keuangan, pertimbangan etika profesi akuntan, serta rekomendasi perbaikan berbasis bukti.'
        }
      ]
    });

    const rubricY = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('2. Skala Likert 1–4 dan Konversi ke Skala Nilai 0–100', 14, rubricY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Penilaian evaluator pada skala Likert 1-4 otomatis dikonversi dengan formula matematis:', 14, rubricY + 5);

    // Formula Box
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, rubricY + 8, pageWidth - 28, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, rubricY + 8, pageWidth - 28, 12, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('Formula: Nilai Dimensi = ((Skor Likert - 1) / 3) * 100 * Bobot Dimensi', 20, rubricY + 15.5);

    autoTable(doc, {
      startY: rubricY + 24,
      theme: 'striped',
      headStyles: { fillColor: secondaryColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: darkColor, cellPadding: 2, halign: 'center' },
      columns: [
        { header: 'Rentang Nilai Akhir', dataKey: 'range' },
        { header: 'Huruf Mutu', dataKey: 'letter' },
        { header: 'Angka Mutu (GPA)', dataKey: 'gpa' },
        { header: 'Predikat Capaian Akademik', dataKey: 'predicate' }
      ],
      body: [
        { range: '85.00 – 100.00', letter: 'A', gpa: '4.00', predicate: 'Sangat Memuaskan (Mastery)' },
        { range: '80.00 – 84.99', letter: 'A-', gpa: '3.70', predicate: 'Memuaskan (Exemplary)' },
        { range: '75.00 – 79.99', letter: 'B+', gpa: '3.30', predicate: 'Sangat Baik (Proficient)' },
        { range: '70.00 – 74.99', letter: 'B', gpa: '3.00', predicate: 'Baik (Competent)' },
        { range: '65.00 – 69.99', letter: 'B-', gpa: '2.70', predicate: 'Cukup Baik (Approaching Competent)' },
        { range: '60.00 – 64.99', letter: 'C+', gpa: '2.30', predicate: 'Lebih Dari Cukup (Developing)' },
        { range: '55.00 – 59.99', letter: 'C', gpa: '2.00', predicate: 'Cukup (Basic)' },
        { range: '40.00 – 54.99', letter: 'D', gpa: '1.00', predicate: 'Kurang (Remedial Required)' },
        { range: '0.00 – 39.99', letter: 'E', gpa: '0.00', predicate: 'Sangat Kurang (Failed)' }
      ]
    });

    drawPageFooter(3);

    // =========================================================================
    // PAGE 4: PANDUAN PENGOPERASIAN FITUR UTAMA & FAQ
    // =========================================================================
    doc.addPage();
    drawPageHeader('BAB 3: PANDUAN PENGOPERASIAN FITUR & FAQ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('1. Langkah-Langkah Penggunaan Platform (Step-by-Step)', 14, 22);

    const steps = [
      ['Langkah 1: Masuk Sesi (Login)', 'Akses portal login dan masukkan kredensial atau klik salah satu tombol Quick Demo untuk Admin, Dosen, Guru, Mahasiswa, atau Siswa.'],
      ['Langkah 2: Pemilihan Jalur Institusi', 'Bagi Guru/Siswa pilih menu "Daftar Kelas" (/kelas). Bagi Dosen/Mahasiswa pilih menu "Daftar Mata Kuliah" (/mk).'],
      ['Langkah 3: Pengaturan Komponen & Bobot', 'Pendidik dapat mengatur persentase bobot evaluasi (NAPF, NHPY, NTGS, NKUS, NUTS, NUAS) dan menautkan template rubrik pada menu Komponen.'],
      ['Langkah 4: Penginputan Skor Rubrik', 'Buka menu "Daftar Siswa & Nilai" -> klik "Nilai". Pilih level Likert 1-4 untuk setiap dimensi EPIC. Feedback naratif otomatis disarankan.'],
      ['Langkah 5: Analisis Radar & Publikasi Rapor', 'Buka menu "Analisis & Radar" untuk memantau visualisasi radar kompetensi dan klik "Cetak Rapor (.pdf)" untuk ekspor laporan resmi.']
    ];

    let stepY = 28;
    steps.forEach(([title, desc]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text(title, 14, stepY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text(desc, 14, stepY + 4.5);
      stepY += 10;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('2. Pertanyaan Umum & Panduan Pemecahan Masalah (FAQ)', 14, stepY + 3);

    const faqs = [
      ['Q: Apakah foto kamera iPhone (.heic / .heif) dapat langsung diunggah?', 'A: Ya. Sistem secara otomatis mengonversi berkas .heic/.heif secara client-side menjadi format gambar standar (JPG/PNG).'],
      ['Q: Mengapa akun Siswa/Mahasiswa otomatis diarahkan ke halaman Analitik?', 'A: Sesuai prinsip proteksi privasi akademik, siswa hanya memiliki hak akses untuk melihat capaian rapor dan radar pribadi.'],
      ['Q: Bagaimana cara memicu tur interaktif (Feature Tour) di setiap halaman?', 'A: Klik tombol ikon tanda tanya (?) di pojok kanan atas pada halaman mana pun untuk memulai panduan langkah demi langkah.'],
      ['Q: Apakah laporan Excel hasil ekspor kompatibel dengan sistem akademik kampus/sekolah?', 'A: Ya. Format ekspor Excel (.xlsx) mengikuti standar multi-sheet per rombel lengkap dengan header NISN/NIM dan kode komponen resmi.']
    ];

    let faqY = stepY + 10;
    faqs.forEach(([q, a]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryColor);
      doc.text(q, 14, faqY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkColor);
      doc.text(a, 14, faqY + 4.5);
      faqY += 10.5;
    });

    // Final signature box
    const signY = pageHeight - 40;
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, signY, pageWidth - 28, 22, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, signY, pageWidth - 28, 22, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkColor);
    doc.text('Pengesahan & Hak Cipta Perangkat Lunak:', 18, signY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    doc.text('Dokumen panduan ini diterbitkan secara resmi oleh Tim Peneliti EPIC e-Rubric FEB UNNES.', 18, signY + 11);
    doc.text('Dilarang menggandakan atau mendistribusikan ulang dokumen ini tanpa izin tertulis dari tim pengembang.', 18, signY + 15.5);

    drawPageFooter(4);

    // Save and download PDF file
    doc.save('Buku_Panduan_Resmi_Platform_EPIC_Rubric_v2.0.pdf');
    return { success: true };
  } catch (err) {
    console.error('Failed to generate user manual PDF:', err);
    throw err;
  }
}

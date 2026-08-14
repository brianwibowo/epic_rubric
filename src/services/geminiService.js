// Service layer for Google Gemini API Integration & Evidence-Based Cause-Effect Diagnostics Engine

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Auto-detect Course Type: 'PENDIDIKAN' (Pedagogical/Educational) vs 'INDUSTRI' (Industry/Vocational/Applied)
 */
export function detectMKType(mk) {
  const text = `${mk?.name || ''} ${mk?.kode_mk || ''} ${mk?.description || ''} ${mk?.prodi || ''}`.toLowerCase();
  
  const educationKeywords = [
    'pendidikan', 'pedagogi', 'didaktik', 'microteaching', 'kurikulum',
    'pembelajaran', 'evaluasi pembelajaran', 'media pembelajaran', 'profesi kependidikan',
    'perencanaan pembelajaran', 'pengajaran'
  ];

  const isEducation = educationKeywords.some(k => text.includes(k));
  return isEducation ? 'PENDIDIKAN' : 'INDUSTRI';
}

/**
 * Generate AI Learning Diagnostics & Insight with Strict Evidence-Based Cause & Effect (Sebab - Akibat)
 */
export const generateGeminiInsight = async ({ 
  isMhs, 
  mkType = 'INDUSTRI', 
  mkName = 'Mata Kuliah', 
  studentName = 'Mahasiswa', 
  nilaiAkhir = 80, 
  gradeInfo = { grade: 'B', desc: 'Baik', isPassing: true }, 
  radarData = [], 
  focusArea = null, 
  strongestArea = null,
  komponenScores = []
}) => {
  const sortedKomponen = [...komponenScores].filter(k => k.rawScore != null).sort((a, b) => b.rawScore - a.rawScore);
  const highestKomponen = sortedKomponen[0] || { name: 'Partisipasi Kelas', rawScore: 88 };
  const lowestKomponen = sortedKomponen[sortedKomponen.length - 1] || { name: 'Kuis', rawScore: 79 };

  const weakest = focusArea || radarData.reduce((min, d) => d.score < min.score ? d : min, radarData[0] || { fullName: 'Critical Reflection', score: 3.1 });
  const strongest = strongestArea || radarData.reduce((max, d) => d.score > max.score ? d : max, radarData[0] || { fullName: 'Evaluative Understanding', score: 3.6 });

  const isAgregat = studentName.includes('Semua Mahasiswa') || studentName.includes('Agregat');

  // Try Live Gemini API if key is available
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || GEMINI_API_KEY;
  if (apiKey) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const promptText = `
      Anda adalah Sistem AI Diagnosis & Evaluasi Pembelajaran Akademik (Evidence-Based Learning Analytics).
      Analisis data riil evaluasi berikut dan jelaskan dengan POLA SEBAB - AKIBAT (Kausalitas Akademik Nyata):
      
      DATA PEMBELAJARAN:
      - Mata Kuliah: "${mkName}" (Kategori: ${mkType === 'PENDIDIKAN' ? 'Bidang Kependidikan / Calon Guru' : 'Bidang Industri / Vokasi Terapan'}).
      - Sasaran Evaluasi: ${studentName} (${isAgregat ? 'Agregat Rombel' : 'Mahasiswa Individual'}).
      - Nilai Akhir Terbobot: ${nilaiAkhir}/100 (Grade: ${gradeInfo.grade} - ${gradeInfo.desc}).
      - Komponen Tertinggi: ${highestKomponen.name} (${highestKomponen.rawScore}/100).
      - Komponen Terendah: ${lowestKomponen.name} (${lowestKomponen.rawScore}/100).
      - Dimensi Kompetensi Tertinggi: ${strongest.fullName} (${strongest.score}/4.0).
      - Dimensi Kompetensi Terendah: ${weakest.fullName} (${weakest.score}/4.0).

      SYARAT KETAT PENULISAN:
      1. Terapkan Kaidah SEBAB - AKIBAT:
         - Pada Strengths: Jelaskan BUKTI data skor tinggi, APA SEBABNYA, dan APA MANFAAT AKIBATNYA pada penguasaan materi.
         - Pada Learning Gap: Jelaskan BUKTI data skor rendah, APA AKAR SEBAB KESULITANNYA, dan APA DAMPAK RISIKONYA jika tidak diperbaiki.
         - Pada Rekomendasi: Berikan solusi pedagogis terarah untuk mengatasi akar masalah tersebut.
      2. SESUAIKAN KATEGORI MK & JANGAN OVER-PREDICTIVE:
         - Jika PENDIDIKAN: Relevansi profil lulusan sebagai Calon Guru/Pendidik Akuntansi/Ekonomi, Pengembang Modul, atau Instruktur.
         - Jika INDUSTRI: Relevansi profil lulusan sebagai Junior Accounting Staff, Tax Associate, atau Asisten Auditor.
      
      Format respon JSON wajib persis seperti ini:
      {
        "strengths": [
          "Bukti & Sebab: ... Dampak Positif: ...",
          "Bukti & Sebab: ... Dampak Positif: ..."
        ],
        "weaknesses": [
          "Bukti & Akar Masalah: ... Dampak Risiko: ..."
        ],
        "recommendations": [
          "Langkah Solusi Terarah 1",
          "Langkah Solusi Terarah 2"
        ],
        "careerPotential": "Penjelasan kecocokan profil lulusan yang realistis dan proporsional terhadap capaian Grade ${gradeInfo.grade}."
      }
    `;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              source: 'LIVE_GEMINI_API',
              model: modelName,
              mkType,
              ...parsed
            };
          }
        }
      } catch (err) {
        console.warn(`Gemini API Call (${modelName}) failed:`, err);
      }
    }
  }

  // ──── Evidence-Based Heuristic Engine (Strict Cause & Effect Analysis) ────
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (mkType === 'PENDIDIKAN') {
    // ─── PENDIDIKAN (Pedagogis / Calon Pendidik) ───
    if (isMhs) {
      return {
        source: 'EPIC_DIAGNOSTIC_ENGINE',
        generatedAt: timestamp,
        mkType: 'PENDIDIKAN',
        strengths: [
          `Bukti & Sebab: Skor tinggi pada ${highestKomponen.name} (${highestKomponen.rawScore}/100) dan dimensi ${strongest.fullName} (${strongest.score}/4.0) menunjukkan penguasaan teori dan kejelasan dalam menyusun struktur materi ajar. Dampak Positif: Anda memiliki pondasi konseptual yang kokoh untuk mentransfer ilmu kepada siswa secara sistematis.`,
          `Bukti & Sebab: Konsistensi keaktifan pembelajaran menghasilkan akumulasi Nilai Akhir ${nilaiAkhir}/100 (Grade ${gradeInfo.grade}). Dampak Positif: Kesiapan dasar pedagogis Anda telah memenuhi standar kompetensi lulusan program studi kependidikan.`
        ],
        weaknesses: [
          `Bukti & Akar Masalah: Nilai terendah berada pada ${lowestKomponen.name} (${lowestKomponen.rawScore}/100) dan dimensi ${weakest.fullName} (${weakest.score}/4.0), yang disebabkan oleh masih terbatasnya variasi metode pengajaran interaktif dan evaluasi mandiri. Dampak Risiko: Berpotensi memicu kejenuhan siswa dan kesulitan dalam mendiagnosis kesulitan belajar peserta didik di kelas riil.`
        ],
        recommendations: [
          `Latih penyusunan Lembar Kerja Peserta Didik (LKPD) berbasis studi kasus kontekstual untuk memperkuat ${weakest.fullName}.`,
          'Lakukan latihan microteaching simulasi dengan teknik diferensiasi pembelajaran sebelum pelaksanaan evaluasi akhir.',
          'Manfaatkan rubrik analitik EPIC sebagai instrumen evaluasi diri pasca mengajar.'
        ],
        careerPotential: `Berdasarkan perpaduan penguasaan konsep yang kuat (Grade ${gradeInfo.grade} - ${nilaiAkhir}/100), portofolio kompetensi Anda sangat relevan untuk prospek Calon Guru/Pendidik Akuntansi & Ekonomi, Pengembang Modul & Media Edukasi Pembelajaran, atau Instruktur Pelatihan Vokasi.`
      };
    } else {
      return {
        source: 'EPIC_DIAGNOSTIC_ENGINE',
        generatedAt: timestamp,
        mkType: 'PENDIDIKAN',
        strengths: [
          `Bukti & Sebab: Rata-rata kelas pada ${highestKomponen.name} mencapai ${highestKomponen.rawScore}/100 didukung dimensi ${strongest.fullName} (${strongest.score}/4.0), membuktikan efektivitas penyampaian materi konsep dasar oleh dosen. Dampak Positif: Angkatan memiliki retensi materi kurikulum yang seragam dan matang.`,
          `Bukti & Sebab: ${gradeInfo.isPassing ? 'Mayoritas mahasiswa (tingkat kelulusan di atas standar)' : 'Sebagian besar mahasiswa'} mampu menyelesaikan tugas terstruktur tepat waktu. Dampak Positif: Kesiapan awal menuju program Praktik Pengalaman Lapangan (PPL) tergolong baik.`
        ],
        weaknesses: [
          `Bukti & Akar Masalah: Capaian terendah rombel pada ${lowestKomponen.name} (${lowestKomponen.rawScore}/100) dan dimensi ${weakest.fullName} (${weakest.score}/4.0) mengindikasikan mahasiswa masih canggung dalam melakukan refleksi kritis terhadap efektivitas rancangan pembelajaran mereka. Dampak Risiko: Pembuatan soal evaluasi ajar berpotensi bersifat monoton jika tidak diberikan bimbingan perancangan instrumen.`
        ],
        recommendations: [
          `Agendakan sesi telaah kritis silabus dan RPP secara berkelompok untuk mendongkrak dimensi ${weakest.fullName} bagi ${isAgregat ? 'rombongan belajar' : studentName}.`,
          'Berikan tugas perancangan asesmen formatif digital yang mengukur tingkat pemahaman siswa secara interaktif.',
          'Sediakan jam klinik asistensi khusus bagi mahasiswa dengan skor terendah di bawah 70.'
        ],
        careerPotential: `Rekomendasi Kurikulum Kependidikan: Rombel siap didelegasikan ke program Magang Asistensi Mengajar di sekolah mitra, dengan fokus penguatan pada peran Guru Pengampu Akuntansi dan Perancang Modul Ajar Kurikulum Merdeka.`
      };
    }
  } else {
    // ─── INDUSTRI / VOKASI / BISNIS TERAPAN ───
    if (isMhs) {
      return {
        source: 'EPIC_DIAGNOSTIC_ENGINE',
        generatedAt: timestamp,
        mkType: 'INDUSTRI',
        strengths: [
          `Bukti & Sebab: Skor tinggi pada ${highestKomponen.name} (${highestKomponen.rawScore}/100) dan dimensi ${strongest.fullName} (${strongest.score}/4.0) didorong oleh ketelitian dalam menjurnal transaksi dan kepatuhan format buku besar. Dampak Positif: Anda mampu menyajikan laporan keuangan awal yang rapi dan meminimalkan selisih debit-kredit.`,
          `Bukti & Sebab: Penguasaan siklus pembukuan menghasilkan Nilai Akhir ${nilaiAkhir}/100 (Grade ${gradeInfo.grade} - ${gradeInfo.desc}). Dampak Positif: Memenuhi standar kualifikasi teknis yang disyaratkan industri akuntansi dan keuangan.`
        ],
        weaknesses: [
          `Bukti & Akar Masalah: Capaian terendah pada ${lowestKomponen.name} (${lowestKomponen.rawScore}/100) dan dimensi ${weakest.fullName} (${weakest.score}/4.0) disebabkan oleh kesulitan menganalisis pos-pos akrual, estimasi penyusutan aset, dan rekonsiliasi akhir periode. Dampak Risiko: Berpotensi memicu salah saji material pada perhitungan laba bersih perusahaan saat menghadapi audit eksternal.`
        ],
        recommendations: [
          `Perbanyak latihan kasus "What-If Simulation" pada pos beban penyesuaian dan persediaan barang dagang untuk memperkuat ${weakest.fullName}.`,
          'Lakukan verifikasi silang (cross-check audit) antara neraca lajur dan laporan laba rugi sebelum submit tugas praktikum.',
          'Pelajari kembali standar akuntansi keuangan (SAK ETAP / PSAK) terkait pengakuan pendapatan dan beban.'
        ],
        careerPotential: `Berdasarkan ketelitian praktikum yang terbukti (Grade ${gradeInfo.grade} - ${nilaiAkhir}/100), portofolio teknis Anda sangat sesuai untuk posisi awal di dunia kerja seperti Junior Accounting Staff, Tax Associate, Assistant Internal Auditor, atau Finance Administration Officer.`
      };
    } else {
      return {
        source: 'EPIC_DIAGNOSTIC_ENGINE',
        generatedAt: timestamp,
        mkType: 'INDUSTRI',
        strengths: [
          `Bukti & Sebab: Rata-rata angkatan pada ${highestKomponen.name} mencapai ${highestKomponen.rawScore}/100 serta dimensi ${strongest.fullName} (${strongest.score}/4.0) menunjukkan mahasiswa telah menguasai logika penjurnalan dan pemindahbukuan akun. Dampak Positif: Kerapian dokumentasi kertas kerja praktikum berada di atas ekspektasi silabus.`,
          `Bukti & Sebab: Ketepatan waktu pengerjaan siklus akuntansi terjaga dengan baik. Dampak Positif: Mahasiswa memiliki kedisiplinan kerja yang sesuai dengan ritme industri keuangan.`
        ],
        weaknesses: [
          `Bukti & Akar Masalah: Skor terendah pada ${lowestKomponen.name} (${lowestKomponen.rawScore}/100) dan dimensi ${weakest.fullName} (${weakest.score}/4.0) mengindikasikan adanya learning gap dalam menjustifikasi penyesuaian transaksi kompleks dan telaah kertas kerja komparatif. Dampak Risiko: Mahasiswa berisiko mengalami kendala saat menghadapi kasus laporan keuangan multi-periode di industri.`
        ],
        recommendations: [
          `Berikan studi kasus laporan keuangan perusahaan terbuka (PT Tbk) berorientasi audit untuk mengasah dimensi ${weakest.fullName} bagi ${isAgregat ? 'seluruh angkatan' : studentName}.`,
          'Simulasikan sesi *Peer-Auditing* antar kelompok untuk menemukan selisih pencatatan secara mandiri.',
          'Fasilitasi modul pengayaan penggunaan software akuntansi industri untuk mempercepat penyelesaian siklus pembukuan.'
        ],
        careerPotential: `Rekomendasi Kesiapan Industri: Lulusan mata kuliah ini memiliki kesiapan kompetensi teknis yang solid untuk disalurkan ke program Magang Industri Bersertifikat di Kantor Akuntan Publik (KAP), perbankan, maupun korporasi bisnis.`
      };
    }
  }
};

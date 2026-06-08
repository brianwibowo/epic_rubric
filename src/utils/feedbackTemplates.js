export const FEEDBACK_TEMPLATES = {
  E: { // Evaluative Understanding
    1: 'Siswa kesulitan memahami konsep dasar persamaan akuntansi dan pencatatan debit-kredit. Perlu bimbingan intensif dari guru untuk materi penggolongan akun.',
    2: 'Siswa memahami konsep dasar akuntansi, tetapi masih sering melakukan kesalahan saat mengklasifikasikan akun aset, liabilitas, dan ekuitas dalam jurnal.',
    3: 'Siswa mampu menganalisis transaksi keuangan dan melakukan penjurnalan dengan tepat sesuai dengan Standar Akuntansi Keuangan (SAK).',
    4: 'Siswa menunjukkan pemahaman konseptual yang luar biasa. Mampu menganalisis transaksi kompleks secara mandiri dan mengklasifikasikannya dengan akurasi 100%.'
  },
  P: { // Predictive Reasoning
    1: 'Siswa belum mampu memproyeksikan saldo akhir buku besar maupun mengantisipasi ketidakseimbangan pada neraca saldo.',
    2: 'Siswa dapat membuat neraca saldo, namun kesulitan mendeteksi penyebab selisih angka dan kurang teliti memproyeksikan penutupan buku besar.',
    3: 'Siswa memiliki penalaran yang baik dalam memperkirakan aliran akun penyesuaian dan memproyeksikan saldo akun riil serta nominal setelah penutupan.',
    4: 'Analisis data sangat tajam. Siswa mampu mendeteksi potensi selisih saldo secara dini dan memproyeksikan laporan laba-rugi serta posisi keuangan dengan sangat akurat.'
  },
  I: { // Intelligent Application
    1: 'Siswa belum mampu menyusun kertas kerja (worksheet) akuntansi maupun laporan keuangan sederhana secara runut.',
    2: 'Siswa mampu menyusun laporan keuangan (Laba Rugi, Perubahan Ekuitas, Neraca) tetapi masih memerlukan bantuan untuk menyelesaikan penyesuaian akhir di kertas kerja.',
    3: 'Siswa terampil mengaplikasikan siklus akuntansi pada kasus riil perusahaan jasa atau dagang menggunakan format kertas kerja standar.',
    4: 'Penerapan siklus akuntansi sangat matang. Kertas kerja diselesaikan secara komprehensif, cepat, tepat, dan sesuai dengan prinsip akuntansi yang berlaku.'
  },
  C: { // Critical Reflection
    1: 'Siswa tidak menyadari kesalahan pencatatan atau ketidaksesuaian angka dan tidak melakukan verifikasi ulang pada lembar kerjanya.',
    2: 'Siswa menyadari adanya kesalahan jumlah saldo, tetapi kesulitan melacak sumber kesalahan jurnal penyesuaian secara mandiri.',
    3: 'Siswa secara kritis memeriksa kembali kertas kerja, mendeteksi selisih angka, dan mampu melakukan koreksi jurnal penyesuaian dengan benar.',
    4: 'Siswa menunjukkan kemampuan audit mandiri yang sangat baik. Mampu memberikan analisis reflektif atas deviasi laporan keuangan dan memberikan solusi jurnal koreksi yang tepat.'
  },
  PE: { // Professional Ethics
    1: 'Dokumen laporan keuangan diselesaikan dengan tidak rapi, banyak coretan, dan tidak mengindahkan batas waktu pengerjaan yang disepakati.',
    2: 'Laporan keuangan cukup lengkap, namun kerapian penulisan angka desimal, garis pembatas saldo, dan ketepatan waktu pengumpulan masih harus ditingkatkan.',
    3: 'Siswa menunjukkan sikap profesional: pengerjaan bersih, penulisan angka rapi, jujur dalam penyajian data keuangan, dan mengumpulkan tepat waktu.',
    4: 'Sikap profesionalisme sangat menonjol. Hasil kerja sangat bersih dan rapi, integritas data keuangan terjaga penuh, serta diselesaikan sebelum batas waktu.'
  }
};

/**
 * Mendapatkan templat umpan balik berdasarkan kode dimensi dan skor Likert.
 * 
 * @param {string} dimension - Kode dimensi ('E', 'P', 'I', 'C', 'PE')
 * @param {number|string} score - Skor Likert (1, 2, 3, 4)
 * @returns {string} Kalimat umpan balik default
 */
export function getFeedbackTemplate(dimension, score) {
  if (!FEEDBACK_TEMPLATES[dimension]) return '';
  return FEEDBACK_TEMPLATES[dimension][Number(score)] || '';
}

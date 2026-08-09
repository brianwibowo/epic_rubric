import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Cetak lembar hasil penilaian individu (Rapor MK Mahasiswa) ke dalam format .pdf resmi
 * Menggunakan html2canvas untuk menjepret DOM layout premium dan jsPDF untuk merender A4.
 * Sesuai spesifikasi PRD v2.0 FR-LA-006.
 * 
 * @param {string} elementId - ID dari elemen DOM kontainer Rapor (misalnya 'report-card-print')
 * @param {string} studentName - Nama lengkap mahasiswa untuk penamaan file
 * @param {string} mkName - Nama Mata Kuliah
 */
export async function exportReportCardToPdf(elementId, studentName, mkName) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    alert('Elemen rapor tidak ditemukan untuk dicetak.');
    return false;
  }

  try {
    // Configure canvas rendering settings for high resolution prints
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution
      useCORS: true,
      backgroundColor: '#f8fafc', // Light clean premium background for print
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Initialize jsPDF A4 format (Portrait, mm, a4)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 standard width in mm
    const pageHeight = 295; // A4 standard height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Draw canvas image onto PDF sheet
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Support multi-page prints if report overflows page boundaries
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const cleanName = (studentName || 'Mahasiswa').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanMK = (mkName || 'MK').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Rapor_EPIC_${cleanName}_${cleanMK}.pdf`;
    
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Gagal mengekspor PDF: ' + error.message);
    return false;
  }
}

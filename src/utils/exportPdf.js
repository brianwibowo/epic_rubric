import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Cetak lembar hasil penilaian individu (Rapor Praktikum) ke dalam format .pdf resmi
 * Menggunakan html2canvas untuk menjepret DOM layout premium dan jsPDF untuk merender A4.
 * Sesuai spesifikasi PRD FR-LA-006.
 * 
 * @param {string} elementId - ID dari elemen DOM kontainer Rapor (misalnya 'report-card-print')
 * @param {string} studentName - Nama lengkap siswa untuk penamaan file
 * @param {string} projectName - Nama proyek praktikum
 */
export async function exportReportCardToPdf(elementId, studentName, projectName) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    alert('Elemen rapor tidak ditemukan untuk dicetak.');
    return;
  }

  try {
    // Show spinner in page or button if needed by parent
    
    // Configure canvas rendering settings for high resolution prints
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution
      useCORS: true,
      backgroundColor: '#080B14', // Maintain dark premium theme style
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

    const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanProject = projectName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Rapor_EPIC_${cleanName}_${cleanProject}.pdf`;
    
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Gagal mengekspor PDF: ' + error.message);
    return false;
  }
}

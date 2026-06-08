import { useState } from 'react';
import { exportClassToExcel } from '@/utils/exportExcel';
import { exportReportCardToPdf } from '@/utils/exportPdf';
import { useUiStore } from '@/stores/uiStore';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useUiStore();

  const exportExcel = (className, projectName, roster) => {
    setIsExporting(true);
    try {
      exportClassToExcel(className, projectName, roster);
      addToast('File Excel (.xlsx) berhasil diunduh!', 'success');
    } catch (e) {
      addToast('Gagal mengekspor Excel: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPdf = async (elementId, studentName, projectName) => {
    setIsExporting(true);
    try {
      const success = await exportReportCardToPdf(elementId, studentName, projectName);
      if (success) {
        addToast('File Rapor PDF (.pdf) berhasil diunduh!', 'success');
      }
    } catch (e) {
      addToast('Gagal mengekspor PDF: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportExcel,
    exportPdf
  };
}

import heic2any from 'heic2any';

/**
 * Check if a file is a HEIC or HEIF image based on name or mime type.
 * @param {File} file 
 * @returns {boolean}
 */
export function isHeicFile(file) {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif'
  );
}

/**
 * Process and convert an image file (supporting PNG, JPG, JPEG, WEBP, GIF, SVG, HEIC, HEIF)
 * into a standard Data URL that can be rendered in any browser.
 * 
 * @param {File} file 
 * @returns {Promise<{ dataUrl: string, file: Blob|File, name: string }>}
 */
export async function processImageUpload(file) {
  if (!file) {
    throw new Error('Tidak ada berkas gambar yang dipilih.');
  }

  // Check if file is HEIC or HEIF
  if (isHeicFile(file)) {
    try {
      // Convert HEIC/HEIF to JPEG blob
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });

      // heic2any can return an array of blobs or a single blob
      const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            dataUrl: reader.result,
            file: singleBlob,
            name: file.name.replace(/\.(heic|heif)$/i, '.jpg')
          });
        };
        reader.onerror = () => reject(new Error('Gagal membaca berkas HEIC yang telah dikonversi.'));
        reader.readAsDataURL(singleBlob);
      });
    } catch (err) {
      console.error('HEIC conversion error:', err);
      throw new Error('Gagal mengonversi format foto HEIC/HEIF. Silakan gunakan format JPG/PNG.');
    }
  }

  // Standard image formats
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result,
        file,
        name: file.name
      });
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });
}

// Helper untuk konversi URL Google Drive ke format Embed/Preview tanpa API Key

export function getGoogleDriveEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const trimmed = url.trim();

    // 1. Ekstrak Folder ID: https://drive.google.com/drive/folders/ID atau ?id=ID
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
    }

    // 2. Ekstrak File ID: https://drive.google.com/file/d/ID/view
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    // 3. Query param id=ID
    const paramMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (paramMatch && paramMatch[1]) {
      if (trimmed.includes('folders') || trimmed.includes('embeddedfolderview')) {
        return `https://drive.google.com/embeddedfolderview?id=${paramMatch[1]}#grid`;
      }
      return `https://drive.google.com/file/d/${paramMatch[1]}/preview`;
    }

    // Jika URL sudah mengandung /preview atau embeddedfolderview
    if (trimmed.includes('/preview') || trimmed.includes('embeddedfolderview')) {
      return trimmed;
    }

    return trimmed;
  } catch (error) {
    return null;
  }
}

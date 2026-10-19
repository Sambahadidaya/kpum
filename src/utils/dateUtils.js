// Utilitas tanggal dan waktu Indonesia (WIB)

export function formatTanggalIndo(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

export function formatWaktuIndo(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date) + ' WIB';
  } catch (error) {
    return dateString;
  }
}

// Menghitung timestamp milidetik untuk jam 00:00:00 WIB hari berikutnya
// Digunakan untuk masa berlaku cache localStorage panduan
export function getNextMidnightWIBTimestamp() {
  const now = new Date();
  // Offset WIB = UTC+7 (420 menit)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 7 * 3600000);

  // Buat jam 00:00:00 WIB esok hari
  const nextMidnightWib = new Date(wibTime);
  nextMidnightWib.setDate(nextMidnightWib.getDate() + 1);
  nextMidnightWib.setHours(0, 0, 0, 0);

  // Konversi kembali ke timestamp lokal milidetik
  const diff = nextMidnightWib.getTime() - wibTime.getTime();
  return Date.now() + diff;
}

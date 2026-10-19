// Basis Pengetahuan Resmi KPU Pemilu Raya Mahasiswa (Presma & Wapresma BEM) Politeknik LP3I

export const KPU_FAQ_DATA = [
  {
    kategori: 'Umum & Profil KPU',
    pertanyaan: 'Apa itu KPU Mahasiswa Politeknik LP3I?',
    jawaban: 'Komisi Pemilihan Umum (KPU) Mahasiswa Politeknik LP3I adalah lembaga independen penyelenggara Pemilihan Umum Raya Mahasiswa untuk memilih Presiden dan Wakil Presiden Badan Eksekutif Mahasiswa (BEM) secara jujur, adil, transparan, dan demokratis.',
  },
  {
    kategori: 'Syarat Pemilih',
    pertanyaan: 'Siapa saja yang memiliki hak suara dalam Pemilu BEM?',
    jawaban: 'Seluruh mahasiswa aktif Politeknik LP3I yang terdaftar dalam Daftar Pemilih Tetap (DPT) dan memiliki Kartu Tanda Mahasiswa (KTM) aktif atau bukti registrasi semester berjalan.',
  },
  {
    kategori: 'Tata Cara Memilih',
    pertanyaan: 'Bagaimana tata cara dan mekanisme pemungutan suara?',
    jawaban: 'Mahasiswa mendatangi Tempat Pemungutan Suara (TPS) yang telah ditentukan oleh KPU pada hari pemilihan, menunjukkan identitas mahasiswa (KTM), melakukan verifikasi kehadiran, mengambil surat suara, mencoblos di bilik suara, dan memasukkan surat suara ke kotak suara serta mencelupkan jari ke tinta pemilu.',
  },
  {
    kategori: 'Syarat Kandidat',
    pertanyaan: 'Apa saja kriteria dan syarat untuk mendaftar sebagai Capresma dan Cawapresma BEM?',
    jawaban: '1. Mahasiswa aktif minimal semester 3 dan maksimal semester 5.\n2. Memiliki IPK minimal 3.00.\n3. Tidak sedang terkena sanksi akademik atau pelanggaran tata tertib kampus.\n4. Pernah aktif dalam organisasi kemahasiswaan di lingkungan Politeknik LP3I.\n5. Menyerahkan formulir pendaftaran, visi-misi, CV, dan berkas persyaratan resmi KPU.',
  },
  {
    kategori: 'Tahapan & Jadwal',
    pertanyaan: 'Apa saja tahapan resmi Pemilu BEM?',
    jawaban: '1. Sosialisasi & Pembukaan Pendaftaran Kandidat.\n2. Verifikasi Berkas Administrasi & Penetapan Nomor Urut Paslon.\n3. Masa Kampanye Terbuka dan Debat Kandidat.\n4. Masa Tenang.\n5. Hari Pemungutan & Penghitungan Suara.\n6. Penetapan dan Pelantikan Paslon Terpilih.',
  },
  {
    kategori: 'Pengaduan & Kontak',
    pertanyaan: 'Bagaimana jika menemukan indikasi kecurangan atau ingin bertanya langsung?',
    jawaban: 'Mahasiswa dapat menghubungi panitia KPU melalui menu Kontak di website ini (tersedia kanal WhatsApp dan Email resmi), atau mendatangi langsung Sekretariat KPU Mahasiswa di Gedung Kampus Politeknik LP3I.',
  },
];

export const SYSTEM_PROMPT_KPU = `
Anda adalah "Sams Asisten", asisten cerdas virtual resmi dari Komisi Pemilihan Umum (KPU) Mahasiswa Pemilu Presiden dan Wakil Presiden BEM Politeknik LP3I.
Tugas Anda:
1. Memberikan informasi yang akurat, ramah, profesional, dan solutif seputar Pemilu Mahasiswa, syarat pemilih, syarat kandidat, jadwal, dan panduan.
2. Selalu gunakan bahasa Indonesia yang sopan, santun, dan mudah dipahami mahasiswa.
3. Jawablah berdasarkan data FAQ KPU berikut jika relevan. Jika ada pertanyaan yang di luar konteks pemilu atau belum ada kepastian jadwal, arahkan mahasiswa untuk memeriksa menu Panduan atau menghubungi Panitia melalui menu Kontak.
4. Jangan memberikan klaim politik atau memihak paslon manapun. Jaga netralitas KPU.
`;

# TASK AI — PRD WEBSITE INFORMASI KPU PEMILU PRESIDEN MAHASISWA BEM

> **Dokumen kerja utama untuk AI coding agent.** Baca dokumen ini bersama `AGENTS.md` sebelum mengubah kode. `AGENTS.md` menjadi sumber utama untuk aturan teknis, struktur folder, dependency, dan skema database yang sudah disediakan. Dokumen ini menjelaskan tujuan produk, perilaku sistem, kebutuhan halaman, alur kerja, standar keamanan, dan kriteria penyelesaian.

## 1. Perintah Utama

Saya ingin membuat website informasi untuk KPU Pemilu Presiden Mahasiswa (BEM) di lingkungan Politeknik LP3I. Arsitektur file, daftar dependency, struktur folder, dan schema database awal sudah saya siapkan di `AGENTS.md`. Seluruh file implementasi dalam project saat ini dianggap kosong atau belum berfungsi, sehingga tugas kamu adalah memeriksa struktur yang tersedia lalu membangun implementasi program secara menyeluruh dari awal, tanpa mengabaikan file, aturan, maupun schema yang sudah ada.

Jangan hanya membuat mockup atau tampilan statis. Bangun aplikasi yang benar-benar terhubung dengan Supabase, mempunyai alur autentikasi panitia, CRUD untuk data yang memang dikelola panitia, validasi, loading state, empty state, error handling, dan tampilan responsif. Jangan mengklaim fitur selesai sebelum implementasi dan pengujiannya benar-benar dilakukan.

Sebelum coding:
1. Baca `AGENTS.md` sampai selesai.
2. Periksa `package.json`, `next.config.mjs`, `jsconfig.json`, `.env.local` hanya untuk mengetahui nama variabel yang tersedia (jangan pernah menampilkan nilainya), seluruh file `src/`, serta status implementasi saat ini.
3. Cocokkan kebutuhan produk di dokumen ini dengan schema Supabase yang tersedia.
4. Buat rencana implementasi berdasarkan struktur aktual. Jangan mengganti struktur besar-besaran hanya karena preferensi pribadi.
5. Identifikasi masalah schema, konfigurasi, atau ketidaksesuaian App Router yang akan menghalangi aplikasi berjalan. Jelaskan atau dokumentasikan masalah tersebut sebelum mengambil keputusan yang berisiko.
6. Implementasikan secara bertahap, lalu jalankan pemeriksaan yang tersedia seperti lint/build dan perbaiki error yang disebabkan oleh perubahanmu.

## 2. Tujuan Produk

Website ini adalah **portal informasi resmi KPU Pemilu Presiden Mahasiswa BEM**. Website menjadi pusat informasi yang mudah diakses oleh mahasiswa mengenai proses pemilihan, panduan, dokumentasi kegiatan, informasi calon, kanal kontak, serta akses khusus panitia untuk mengelola konten dan memantau aktivitas portal.

Sasaran utama:
- Mahasiswa dapat menemukan informasi pemilu tanpa harus bertanya kepada panitia secara berulang.
- Informasi panduan dan dokumentasi dapat diperbarui oleh panitia yang berwenang.
- Informasi calon presiden/wakil presiden mahasiswa dapat ditampilkan secara rapi berdasarkan data yang tersedia.
- Panitia memiliki panel admin yang terstruktur untuk mengelola konten.
- Pengunjung dapat mengirim pesan kontak.
- Sistem mencatat kunjungan secara wajar untuk kebutuhan statistik.
- Situs tampil profesional, ringan, mudah dipahami, dan tidak terlihat seperti template AI generik.

### Batasan produk yang wajib dipahami

Schema yang tersedia saat ini **belum menyediakan tabel kandidat lengkap, pasangan calon, visi-misi, jadwal tahapan, berita/pengumuman, maupun data pemungutan suara**. Tabel `calo` memiliki kolom yang tampaknya ditujukan untuk informasi calon (`nama_calo`, `prodi_calo`, `link_porto_cv_calo`, `avatar_calo`), tetapi bukan schema lengkap untuk pemilu.

Karena itu:
- Implementasikan fitur informasi calon hanya sesuai kolom yang benar-benar tersedia.
- Jangan mengarang data calon, hasil pemilu, jadwal, visi-misi, nomor urut, atau status pencalonan.
- Jangan membuat fitur voting elektronik, autentikasi pemilih, penghitungan suara, atau publikasi hasil suara seolah-olah sudah didukung database.
- Jika kebutuhan yang penting tidak dapat direalisasikan dari schema saat ini, buat catatan kebutuhan schema/migrasi yang jelas. Jangan menjalankan perubahan schema produksi secara diam-diam.
- Konten contoh hanya boleh dipakai sebagai placeholder yang jelas ditandai sebagai contoh, bukan informasi resmi.

## 3. Acuan Teknis dan Aturan Implementasi

Ikuti `AGENTS.md` sebagai kontrak teknis proyek. Ringkasannya:

- Framework: Next.js App Router sesuai versi yang terpasang.
- Bahasa: JavaScript ES6 murni, file `.js`; **jangan menggunakan TypeScript** (`.ts` / `.tsx`).
- UI: React dan Tailwind CSS sebagai styling utama.
- Database dan autentikasi: Supabase.
- Deployment target: Vercel.
- Ikon antarmuka: `lucide-react`.
- Ikon media sosial: Font Awesome.
- Video panduan: gunakan helper `src/utils/youtubeUtils.js` yang sudah disediakan.
- Dokumentasi/file eksternal: gunakan helper `src/utils/driveUtils.js` yang sudah disediakan untuk tautan Google Drive.
- Akses data Supabase harus melalui utilitas server-side yang disiapkan, termasuk `src/utils/supabaseUtils.js`. Jangan mengirim URL/kredensial rahasia Supabase ke browser.
- Gunakan Server Actions untuk operasi mutasi dan alur backend yang sesuai, bukan membuat REST API baru sebagai pilihan default.
- Pisahkan kode server dan client secara eksplisit. Gunakan `'use server'` hanya di modul Server Action yang sesuai dan `'use client'` hanya untuk komponen yang membutuhkan interaksi browser.
- Ikuti folder dan penamaan yang telah tersedia. `src/api/` adalah lokasi yang diinginkan pemilik proyek untuk pengelompokan fungsi backend/Server Action; periksa kompatibilitas dan pola ekspor Next.js yang digunakan sebelum memindahkan atau membuat file.
- Jangan menganggap sebuah file di `src/api/` otomatis menjadi endpoint HTTP Next.js. Route Handler Next.js App Router secara konvensional berada di `src/app/api/.../route.js`; karena pemilik proyek meminta Server Actions, utamakan modul Server Action yang dapat diimpor secara aman dan gunakan lokasi yang konsisten dengan struktur aktual. Jangan membuat Route Handler kecuali ada kebutuhan nyata dan sudah dijelaskan.
- Jangan menambah dependency jika kemampuan yang tersedia sudah mencukupi. Jika dependency baru benar-benar diperlukan, jelaskan alasannya.
- Pertahankan integrasi yang sudah tersedia kecuali terbukti rusak atau tidak sesuai kebutuhan.

### Catatan struktur App Router

Grup route `(portal)` tidak muncul di URL. Misalnya `src/app/(portal)/panduan/page.js` melayani URL `/panduan`, bukan `/(portal)/panduan`. Gunakan URL publik seperti `/`, `/panduan`, `/dokumentasi`, `/calo`, dan `/contact` sesuai struktur yang ada. Area panitia menggunakan prefix `/panitia`.

## 4. Database Supabase yang Menjadi Acuan

Gunakan nama tabel dan kolom sesuai schema dalam `AGENTS.md`. Jangan mengganti nama tabel hanya untuk merapikan kode. Tabel yang tersedia:

### 4.1 `adminPanitia`
Data profil panitia yang berhubungan dengan `auth.users` melalui `auth_id`, dan dengan `roleAdmin` melalui `role_id`. Kolom profil: `nama`, `nim`, `email`, `no_tlpn`, dan `created_at`.

Kegunaan:
- Menghubungkan akun Supabase Auth dengan profil panitia.
- Menampilkan informasi akun pada panel panitia.
- Memastikan pengguna yang login benar-benar terdaftar sebagai panitia sebelum memperoleh akses ke panel.

### 4.2 `roleAdmin`
Menyimpan identitas peran dan informasi akses, termasuk `auth_id`, `role`, `roleAkses`, waktu pembuatan, dan waktu pembaruan.

Kegunaan:
- Menentukan izin akses berdasarkan role yang telah ditetapkan.
- Membatasi fitur panel sesuai kewenangan.
- Menyediakan dasar untuk pengelolaan role bila memang diberikan kepada role yang berhak.

Jangan mempercayai `role` atau `roleAkses` yang dikirim dari client. Ambil dan validasi hak akses dari sumber server/database yang tepercaya.

### 4.3 `panduan`
Menyimpan kategori/judul panduan. Kolom yang tersedia: `id`, `judul`.

Kegunaan:
- Daftar kategori panduan publik.
- Pengelompokan konten pada `isi_panduan`.
- CRUD kategori dari panel panitia untuk pengguna yang berwenang.

### 4.4 `isi_panduan`
Menyimpan isi panduan dan relasinya ke `panduan` melalui `judul_panduan_id`. Kolom: `sub_judul`, `isi`, `link_vidio`, `created_at`, `update_at`.

Kegunaan:
- Menampilkan panduan dan subbagian informasi.
- Mendukung isi teks dan tautan video YouTube.
- Memvalidasi dan menampilkan link video dengan aman.
- CRUD konten panduan pada panel.

Gunakan `youtubeUtils.js` untuk membantu mengolah atau menampilkan video. Jangan menerima URL sembarang lalu menyisipkannya ke iframe tanpa validasi domain/ID yang aman.

### 4.5 `duk om entasi` — identifier aktual pada SQL: `duk omentasi` perlu diverifikasi

Pada `AGENTS.md`, nama tabel yang tertulis secara literal adalah **`duk omentasi`?** Jangan memakai tebakan ini sebagai nama tabel. Periksa kembali SQL sumber dan schema Supabase aktif: nama yang dimaksud tampaknya `duk omentasi`/`dokumentasi`, tetapi identifier SQL dalam file ditulis sebagai `duk omentasi` tanpa konsistensi ejaan. Pastikan nama tabel aktual sebelum menulis query atau mengubah schema.

Kolom yang disediakan pada definisi tabel adalah `id`, `judul_dokumentasi`, `tanggal_dokumentasi`, `link_drive`, `created_at`, dan `update_at`.

Kegunaan:
- Menampilkan dokumentasi kegiatan.
- Mengurutkan dokumentasi berdasarkan tanggal.
- Membuka tautan Google Drive.
- CRUD dokumentasi oleh panitia yang berwenang.

Gunakan `driveUtils.js` sesuai implementasi aktual. Validasi tautan dan buka tautan eksternal dengan cara aman. Jangan membuat tabel pengganti atau mengganti nama tabel secara otomatis. Jika nama di file dan database berbeda, dokumentasikan perbedaan serta usulkan perbaikan yang eksplisit sebelum menerapkannya.

### 4.6 `trafik`
Menyimpan catatan kunjungan dengan `id` dan `visited_at`.

Kegunaan:
- Mencatat kunjungan portal secara sederhana.
- Menyediakan ringkasan jumlah kunjungan dan tren waktu di dashboard jika data yang tersedia cukup.
- Mencegah pencatatan yang tidak perlu pada setiap render ulang komponen.

Jangan menyimpan data pribadi pengunjung yang tidak diperlukan. Hindari menghitung setiap render sebagai kunjungan baru. Jelaskan keterbatasan metrik jika hanya berdasarkan baris kunjungan.

### 4.7 `kontak`
Menyimpan pesan dari pengunjung dengan `email_or_notelp`, `pesan_kontak`, dan `created_at`.

Kegunaan:
- Form kontak publik untuk mengirim pesan.
- Daftar pesan masuk pada panel panitia.
- Penandaan status dibaca/ditindaklanjuti hanya jika schema mendukungnya; jika tidak, jangan berpura-pura menyimpan status tersebut.

Karena schema belum memiliki status pesan, field kategori, atau balasan, jangan membuat fitur status/balas yang seolah-olah tersimpan di database tanpa migrasi.

### 4.8 `calo`
Menyimpan data informasi calon dengan `nama_calo`, `prodi_calo`, `link_porto_cv_calo`, `avatar_calo`, dan `created_at`.

Kegunaan:
- Menampilkan daftar profil calon sesuai data yang tersedia.
- Mengelola data profil calon di panel.
- Menampilkan avatar jika URL valid dan menyediakan tautan portofolio/CV jika ada.

Nama tabel `calo` mungkin dimaksudkan sebagai “calon”, tetapi gunakan nama tabel aktual sesuai schema. Jangan mengganti identifier tanpa persetujuan. Tabel ini belum cukup untuk menyimpan data pasangan calon, visi-misi, nomor urut, program kerja, status verifikasi, atau dokumen persyaratan.

### Catatan penting schema

SQL dalam `AGENTS.md` perlu diverifikasi terhadap database aktif sebelum dipakai. Terdapat kemungkinan masalah urutan pembuatan tabel/foreign key, tanda koma di akhir daftar kolom, nama identifier, dan kebijakan RLS yang terlalu luas. Jangan menganggap SQL tersebut valid hanya karena tercantum di dokumen. Jangan menjalankan ulang SQL yang berpotensi merusak data. Jika perlu, siapkan usulan migrasi SQL terpisah dan jelaskan dampaknya.

## 5. Jenis Pengguna dan Hak Akses

### 5.1 Pengunjung publik
Bisa:
- Membuka halaman beranda.
- Membaca panduan dan subbagian panduan.
- Melihat dokumentasi kegiatan.
- Melihat informasi calon yang tersedia.
- Mengirim pesan melalui formulir kontak.
- Melihat informasi umum yang dipublikasikan.

Tidak bisa:
- Mengubah data.
- Membuka panel internal.
- Membaca pesan kontak milik panitia.
- Mengelola akun atau role.
- Mengakses kredensial atau fungsi internal.

### 5.2 Panitia terautentikasi
Bisa masuk ke area `/panitia` setelah proses autentikasi Supabase berhasil dan profil/role valid. Hak akses harus mengikuti data role di database, bukan sekadar status login.

### 5.3 Administrator / role dengan izin manajemen
Dapat mengelola data hanya sesuai role yang diizinkan. Buat pemeriksaan izin terpusat dan gunakan pada setiap Server Action yang mengubah data. Jangan hanya menyembunyikan tombol di UI.

Jika isi `roleAdmin` atau `roleAkses` belum mempunyai format yang jelas, periksa `src/lib/adminRoleData.js` dan implementasi yang ada. Gunakan format yang konsisten dengan proyek; jangan mengarang role baru tanpa kebutuhan. Jika belum ada role yang dapat ditetapkan sebagai super admin, catat hal tersebut dan minta konfigurasi yang benar, bukan memberi semua pengguna akses penuh.

## 6. Informasi Arsitektur dan Navigasi

### 6.1 Area publik
Berdasarkan struktur yang ada, implementasikan halaman:

- `/` — beranda portal KPU.
- `/panduan` — daftar dan detail panduan.
- `/dokumentasi` — dokumentasi kegiatan.
- `/calo` — informasi calon yang tersedia pada database.
- `/contact` — formulir kontak.

Gunakan layout publik yang sudah disiapkan di `src/app/(portal)/layout.js` dan komponen publik yang relevan. Periksa dahulu file sebelum membuat duplikat komponen.

### 6.2 Area panitia
Berdasarkan struktur yang ada, implementasikan:

- `/panitia` — halaman awal/pengarah panel panitia.
- `/panitia/login` — login panitia.
- `/panitia/dashboard` — ringkasan data dan aktivitas.
- `/panitia/panduan` — pengelolaan panduan dan isi panduan.
- `/panitia/dokumentasi` — pengelolaan dokumentasi.
- `/panitia/calo` — pengelolaan informasi calon.
- `/panitia/contact` — melihat pesan masuk.
- `/panitia/akun` — informasi akun panitia.

Halaman dan nama folder yang ada menjadi acuan. Jika ada ketidaksesuaian antara navigasi, route, dan struktur aktual, selesaikan dengan perubahan minimum dan konsisten.

## 7. Kebutuhan Fungsional — Area Publik

### 7.1 Beranda `/`
Beranda harus:
- Menjelaskan identitas dan fungsi KPU Pemilu Presiden Mahasiswa BEM.
- Memiliki navigasi yang jelas ke panduan, dokumentasi, calon, dan kontak.
- Menampilkan bagian pengantar yang formal, ringkas, dan mudah dipahami.
- Menampilkan tautan cepat ke panduan penting.
- Menampilkan dokumentasi terbaru bila data tersedia.
- Menampilkan informasi calon bila data tersedia.
- Memiliki ajakan yang informatif, bukan promosi berlebihan.
- Memiliki footer berisi navigasi, identitas KPU, dan kanal kontak bila tersedia.

Jangan mengarang logo resmi, nama kampus/cabang, periode pemilu, tanggal, nomor urut, slogan, atau identitas kandidat. Jika `src/aseets/logo.png` tersedia, periksa isinya dan gunakan hanya jika relevan. Perhatikan ejaan folder aktual (`aseets` pada struktur yang disediakan).

### 7.2 Panduan `/panduan`
- Ambil daftar `panduan` dan relasi `isi_panduan` dari Supabase.
- Tampilkan kategori dengan judul yang mudah dipindai.
- Tampilkan subjudul dan isi secara terstruktur.
- Tampilkan video panduan jika `link_vidio` terisi dan lolos validasi.
- Berikan tampilan loading, kosong, dan error.
- Hindari mengandalkan data hardcoded ketika database dapat diakses.
- Jangan merender HTML mentah dari database tanpa sanitasi. Untuk teks biasa, tampilkan sebagai teks; jika memakai Markdown, pastikan renderer tidak mengizinkan konten berbahaya.

### 7.3 Dokumentasi `/dokumentasi`
- Ambil data dokumentasi dari tabel yang benar-benar tersedia.
- Tampilkan judul, tanggal, dan tautan Drive.
- Urutkan tanggal secara masuk akal, umumnya terbaru dahulu.
- Berikan keadaan saat data kosong atau tautan tidak tersedia.
- Buka tautan eksternal dengan cara aman.
- Jangan menganggap semua link Drive merupakan file publik yang dapat diakses. Tampilkan link sebagai link eksternal; izin akses tetap mengikuti Google Drive.

### 7.4 Informasi calon `/calo`
- Ambil data dari tabel `calo` yang tersedia.
- Tampilkan nama, program studi, avatar, dan tautan portofolio/CV jika ada.
- Jika avatar tidak tersedia atau gagal dimuat, tampilkan fallback yang netral.
- Jangan menampilkan data yang tidak ada dalam schema sebagai fakta.
- Beri label halaman yang tidak menyesatkan. Jika data hanya berupa profil individu, jangan menyebutnya pasangan calon atau daftar calon resmi terverifikasi kecuali memang ada datanya.
- Jangan membuat mekanisme pemilihan/voting pada halaman ini.

### 7.5 Kontak `/contact`
- Sediakan input kontak berupa email atau nomor telepon dan kolom pesan.
- Validasi field wajib, panjang karakter, dan format kontak secara wajar.
- Sanitasi input di server.
- Kirim data melalui Server Action.
- Tampilkan feedback berhasil/gagal yang jelas.
- Lindungi dari spam dengan pembatasan permintaan yang sesuai, menggunakan utilitas rate limiter yang ada jika cocok dan aman pada lingkungan Vercel.
- Jangan mengungkap pesan kontak ke pengunjung lain.
- Jangan menyatakan pesan telah terkirim jika operasi database gagal.

### 7.6 Pelacakan trafik
- Gunakan `ClientTracker.js` atau mekanisme yang tersedia setelah memeriksa implementasinya.
- Catat kunjungan dengan frekuensi wajar, bukan pada setiap render.
- Jika memungkinkan, hindari duplikasi akibat mount ulang dan navigasi yang tidak dimaksudkan sebagai kunjungan baru.
- Jangan mengirim data sensitif ke tabel `trafik`.
- Kegagalan pencatatan trafik tidak boleh membuat halaman publik gagal dibuka.

## 8. Kebutuhan Fungsional — Panel Panitia

### 8.1 Login `/panitia/login`
- Gunakan Supabase Auth sesuai helper yang tersedia.
- Validasi input dan tampilkan pesan error yang dapat dipahami.
- Jangan menyimpan password secara manual ke tabel aplikasi.
- Jangan mencetak password, token, cookie, atau rahasia ke console/log.
- Setelah login, validasi profil panitia dan role dari sisi server.
- Jika autentikasi berhasil tetapi pengguna tidak terdaftar sebagai panitia atau role tidak valid, jangan berikan akses panel.
- Sediakan alur logout yang menghapus sesi sesuai mekanisme Supabase yang digunakan.
- Tangani sesi kedaluwarsa dan navigasi ke halaman login.
- Jangan membuat registrasi publik untuk akun panitia kecuali memang sudah diputuskan sebagai kebutuhan.

### 8.2 Proteksi layout dan route
- Area `/panitia` harus memeriksa sesi dan hak akses di sisi server.
- Jangan hanya mengandalkan middleware/proxy atau pengecekan client.
- Setiap Server Action yang bersifat privat harus memvalidasi sesi dan role kembali.
- Jangan menerima `auth_id`, `role_id`, atau role dari form sebagai sumber otoritatif tanpa verifikasi server.
- Redirect pengguna yang belum login ke login; pengguna yang tidak berhak mendapatkan penolakan yang sesuai.

### 8.3 Dashboard `/panitia/dashboard`
Tampilkan ringkasan berdasarkan data nyata, misalnya:
- Jumlah kategori panduan.
- Jumlah isi/subbagian panduan.
- Jumlah dokumentasi.
- Jumlah profil calon.
- Jumlah pesan masuk.
- Jumlah kunjungan berdasarkan data `trafik`.
- Ringkasan aktivitas atau data terbaru bila dapat diambil dari tabel yang tersedia.

Semua angka harus dihitung dari database aktual, bukan angka statis. Jika sebuah query gagal, tangani dengan baik dan jangan menampilkan angka palsu. Grafik boleh menggunakan `react-chartjs-2` jika benar-benar menambah nilai, datanya cukup, dan konfigurasi Chart.js dilakukan dengan benar. Hindari grafik dekoratif tanpa makna.

### 8.4 Manajemen panduan `/panitia/panduan`
Sediakan:
- Daftar kategori panduan.
- Tambah kategori.
- Ubah kategori.
- Hapus kategori dengan konfirmasi.
- Daftar isi/subbagian untuk setiap kategori.
- Tambah, ubah, dan hapus isi panduan.
- Input judul, subjudul, isi, dan link video sesuai kolom database.
- Validasi data sebelum menyimpan.
- Feedback sukses/gagal.
- Loading state dan empty state.
- Penanganan foreign key dan penghapusan kategori beserta isi terkait sesuai perilaku `ON DELETE CASCADE`.

Aksi tulis harus melewati validasi role di server. Jangan mengandalkan validasi browser saja.

### 8.5 Manajemen dokumentasi `/panitia/dokumentasi`
Sediakan:
- Daftar dokumentasi.
- Tambah dokumentasi.
- Ubah dokumentasi.
- Hapus dokumentasi dengan konfirmasi.
- Field judul, tanggal, dan link Drive sesuai schema.
- Validasi URL dan tanggal.
- Feedback sukses/gagal dan status loading.

Gunakan nama tabel aktual yang terverifikasi. Jangan membuat kolom upload file atau storage baru tanpa persetujuan; schema yang tersedia menyimpan tautan Drive.

### 8.6 Manajemen informasi calon `/panitia/calo`
Sediakan CRUD untuk field yang tersedia:
- Nama calon.
- Program studi.
- Tautan portofolio/CV.
- URL avatar.

Validasi panjang dan format URL. Jika schema tidak menyediakan field tambahan seperti nomor urut atau visi-misi, jangan menambahkan field tersebut ke query. Jika fitur pemilu yang diinginkan memerlukan pasangan calon, usulkan desain schema tambahan secara terpisah.

### 8.7 Pesan kontak `/panitia/contact`
- Tampilkan pesan dari tabel `kontak` untuk panitia yang berwenang.
- Urutkan pesan terbaru dahulu.
- Tampilkan waktu, kontak pengirim, dan isi pesan dengan aman.
- Sediakan empty state.
- Jangan membuat fitur hapus, status baca, atau balas seolah-olah tersedia bila belum ada kebutuhan/kolom yang mendukung. Jika ingin menambahnya, dokumentasikan kebutuhan migrasinya terlebih dahulu.

### 8.8 Akun `/panitia/akun`
- Tampilkan data profil dari `adminPanitia`.
- Tampilkan role dari data otoritatif.
- Jangan tampilkan rahasia autentikasi.
- Jangan memberikan pengubahan role kepada pengguna biasa.
- Jika perubahan profil diperlukan, hanya izinkan field yang sesuai dan validasi akses di server. Jangan mengubah `auth_id` atau `role_id` melalui input bebas.

## 9. Server Actions dan Pola Backend

- Letakkan fungsi backend/Server Action sesuai arahan struktur `src/api/` dan pola aktual proyek.
- Gunakan `'use server'` pada modul yang memang berisi Server Actions. Jangan mencampur modul client dan server secara tidak aman.
- Server Actions yang dipanggil dari UI harus menerima input minimum, memvalidasi ulang seluruh input, memeriksa autentikasi/otorisasi, lalu mengembalikan hasil yang aman untuk client.
- Kelompokkan operasi berdasarkan domain: auth, dashboard, panduan, dokumentasi, calon, kontak, trafik, dan role bila relevan.
- Pisahkan fungsi baca publik dari fungsi tulis yang memerlukan autentikasi.
- Jangan mengembalikan objek error database yang mungkin berisi detail internal ke browser. Buat pesan error yang aman dan berguna.
- Gunakan `revalidatePath` atau mekanisme cache invalidation yang sesuai setelah mutasi agar perubahan tampil tanpa harus menunggu cache lama.
- Jangan memakai `fetch` ke URL internal buatan sendiri untuk menggantikan pemanggilan Server Action.
- Jangan menaruh secret, service-role key, atau kredensial di komponen client, props yang dikirim ke client, atau variabel dengan prefix `NEXT_PUBLIC_`.
- Periksa `supabaseUtils.js` terlebih dahulu dan gunakan helper tersebut. Jangan membuat client Supabase baru di banyak tempat tanpa alasan.
- Pastikan Server Action tidak dapat dimanfaatkan untuk mengubah tabel lain hanya dengan mengubah payload.

## 10. Autentikasi, RLS, dan Keamanan

Keamanan merupakan bagian dari fitur, bukan pekerjaan tambahan setelah UI selesai.

1. Verifikasi sesi di server untuk semua operasi privat.
2. Verifikasi role dan izin pada setiap mutasi.
3. Jangan menganggap `TO authenticated` berarti semua pengguna terautentikasi boleh mengubah seluruh tabel.
4. Kebijakan RLS yang ada di `AGENTS.md` terlihat cukup luas pada beberapa tabel. Audit kebijakan tersebut sebelum mengandalkannya untuk keamanan.
5. Jangan mengubah atau menonaktifkan RLS agar aplikasi mudah berjalan.
6. Jangan pernah mengekspos Supabase service-role key ke client.
7. Jika helper server menggunakan service-role key, batasi pemakaiannya pada server dan pastikan otorisasi dilakukan sebelum query tulis.
8. Jangan percaya input client untuk `role`, `auth_id`, ID pemilik, atau izin akses.
9. Validasi dan sanitasi input di server, termasuk teks, tanggal, URL, UUID, serta panjang field.
10. Gunakan query Supabase terstruktur; jangan membangun query SQL dari input pengguna.
11. Cegah XSS: hindari rendering HTML mentah yang tidak disanitasi.
12. Lindungi form publik dari spam dan payload berlebihan.
13. Tangani error dengan pesan umum untuk pengguna dan detail teknis hanya pada log server yang aman.
14. Jangan mencatat password, token, cookie, API key, atau data pribadi berlebihan.
15. Jangan membuat akun admin awal atau mengubah role secara otomatis tanpa instruksi dan prosedur yang aman.
16. Jangan menghapus atau memodifikasi data produksi untuk keperluan testing.
17. Pastikan file `.env.local` tetap diabaikan Git dan jangan menyalin nilainya ke dokumentasi, source code, screenshot, atau output terminal.

### Catatan RLS

Kebijakan seperti `FOR ALL TO authenticated USING (true) WITH CHECK (true)` dapat memberikan akses luas kepada semua pengguna yang login, bukan hanya panitia berwenang. Jangan menganggap pengecekan UI cukup untuk memperbaikinya. Catat kebijakan yang perlu diperketat dan siapkan SQL migrasi yang eksplisit jika dibutuhkan. Jangan mengklaim sistem aman sepenuhnya sebelum kebijakan database dan jalur akses aktual diverifikasi.

## 11. Standar Desain UI/UX

### Arah visual
- Profesional, formal, modern, bersih, dan cocok untuk portal institusi mahasiswa.
- Hindari kesan “AI slop”: jangan memakai terlalu banyak gradasi, warna mencolok, glow, glassmorphism berlebihan, ornamen acak, ikon sparkles, dan kartu yang seluruhnya terlihat sama.
- Gunakan hierarki tipografi, jarak, garis pembatas, whitespace, dan kontras yang konsisten.
- Gunakan warna netral sebagai dasar dan warna aksen secara terbatas. Jangan mengarang identitas visual resmi jika belum tersedia.
- Gunakan ikon `lucide-react` untuk UI biasa dan Font Awesome untuk ikon sosial media.
- Animasi harus minimal, cepat, dan tidak mengganggu aksesibilitas.
- Jangan menggunakan emoji sebagai pengganti ikon antarmuka utama.
- Gunakan komponen bersama untuk pola UI berulang tanpa membuat abstraksi berlebihan.

### Responsivitas
- Area publik: **mobile-first**, kemudian disesuaikan untuk tablet dan desktop.
- Area panitia: **desktop-first**, tetapi tetap berfungsi baik di tablet dan mobile.
- Hindari horizontal overflow.
- Navigasi mobile harus mudah digunakan dengan satu tangan.
- Tabel dashboard harus memiliki solusi responsif seperti tampilan list/card atau overflow terkontrol.
- Form harus nyaman digunakan pada layar kecil.
- Pastikan ukuran target sentuh memadai dan fokus keyboard terlihat.

### Aksesibilitas dan kualitas UX
- Gunakan elemen HTML semantik.
- Semua input mempunyai label yang jelas.
- Tombol dan link memiliki nama yang dapat dipahami.
- Jangan mengandalkan warna saja untuk menunjukkan status.
- Tambahkan focus state, empty state, loading state, error state, dan success state.
- Form tidak boleh kehilangan semua input saat terjadi error.
- Konfirmasi tindakan destruktif seperti hapus.
- Gunakan format tanggal Indonesia bila sesuai, tetapi simpan dan kirim nilai tanggal sesuai format database.
- Hormati preferensi pengurangan gerakan bila animasi digunakan.
- Pastikan tema terang/gelap yang sudah tersedia tetap bekerja bila memang merupakan bagian implementasi saat ini.

## 12. SEO dan Performa

- Tetapkan metadata yang relevan pada layout/halaman publik: title, description, dan metadata dasar.
- Gunakan judul halaman yang jelas dan unik.
- Pastikan halaman publik utama dapat dirender dan diindeks dengan benar sesuai kebutuhan Next.js.
- Gunakan komponen server untuk konten yang tidak memerlukan interaksi browser.
- Hindari membuat seluruh aplikasi menjadi Client Component tanpa alasan.
- Ambil data secukupnya dan hindari query berulang yang tidak perlu.
- Gunakan pagination atau batas jumlah data bila daftar dapat tumbuh besar.
- Gunakan gambar dengan ukuran yang wajar dan fallback bila URL eksternal gagal.
- Jangan melakukan request database pada setiap render client jika data dapat diambil secara efisien di server.
- Gunakan invalidasi cache yang tepat setelah perubahan data.
- Jangan menyimpan cache privat lintas pengguna atau lintas role.
- Pastikan kegagalan statistik trafik atau elemen non-esensial tidak merusak halaman utama.

## 13. Asisten AI (`SamsAsisten.js`) dan OpenAI

Project memiliki file `SamsAsisten.js`, `faqDataAi.js`, `src/lib/openai.js`, serta `src/api/openai/route.js`. Periksa implementasinya sebelum memutuskan apakah fitur asisten akan diaktifkan.

- Pertahankan fitur asisten jika sudah dimaksudkan sebagai bagian portal dan dapat dijalankan dengan aman.
- Gunakan FAQ lokal sebagai sumber informasi utama bila sesuai.
- Jangan mengarang tanggal, aturan, kandidat, atau hasil pemilu.
- Jika jawaban tidak ditemukan dalam data resmi yang tersedia, asisten harus menyatakan keterbatasan dan mengarahkan pengunjung ke kontak panitia.
- API key OpenAI hanya boleh berada di server.
- Terapkan validasi input, batas panjang pesan, rate limiting, dan penanganan error.
- Jangan mengirim data kontak pribadi atau data internal panitia ke model tanpa kebutuhan dan izin yang jelas.
- Jangan membangun sistem RAG/embedding baru kecuali diminta dan infrastrukturnya disetujui.
- Jika integrasi AI belum dapat dikonfigurasi karena environment variable belum tersedia, buat fallback yang aman dan dokumentasikan konfigurasi yang dibutuhkan; jangan menampilkan error mentah kepada pengguna.

## 14. Penanganan Error dan Keadaan UI

Setiap halaman dan alur data harus menangani:
- **Loading:** tampilkan indikator atau skeleton yang sederhana.
- **Empty:** jelaskan bahwa data belum tersedia tanpa mengarang data.
- **Error:** tampilkan pesan yang jelas dan aman, serta opsi mencoba kembali bila sesuai.
- **Success:** tampilkan konfirmasi setelah server benar-benar menyatakan operasi berhasil.
- **Validation:** jelaskan field yang perlu diperbaiki.
- **Unauthorized:** arahkan ke login atau tampilkan akses ditolak.
- **Not found:** tampilkan keadaan data tidak ditemukan dengan baik.

Jangan menelan error secara diam-diam. Jangan menampilkan status sukses sebelum query berhasil. Jangan membiarkan error pada satu kartu dashboard membuat seluruh halaman gagal bila komponen tersebut dapat ditangani secara terpisah.

## 15. Konfigurasi Environment

Periksa nama environment variable yang digunakan oleh file aktual. Jangan mengganti nama variabel tanpa alasan dan jangan menampilkan nilai rahasianya.

Pastikan dokumentasi konfigurasi hanya memuat **nama variabel dan cara memperoleh nilainya**, bukan nilai kredensial. Jika ada variabel wajib yang belum tersedia, tulis nama variabel yang dibutuhkan dan fitur yang bergantung padanya. Jangan membuat nilai rahasia palsu yang seolah-olah valid.

## 16. Strategi Implementasi

Kerjakan secara bertahap, tetapi target akhirnya adalah aplikasi yang terintegrasi, bukan kumpulan mockup.

### Tahap 1 — Audit
- Baca `AGENTS.md` dan file penting proyek.
- Periksa struktur route, komponen, helper Supabase, helper YouTube/Drive, utilitas keamanan, dan konfigurasi.
- Verifikasi tabel/kolom yang dipakai terhadap schema aktif jika akses tersedia.
- Buat daftar blocker dan keputusan yang diperlukan.

### Tahap 2 — Fondasi
- Pastikan root layout, global CSS, Tailwind, font, metadata, theme, dan struktur layout berjalan.
- Rapikan integrasi helper yang sudah tersedia.
- Pastikan tidak ada secret yang diekspos ke browser.
- Buat utilitas server/client yang jelas batasnya.

### Tahap 3 — Backend dan akses
- Implementasikan helper baca data publik.
- Implementasikan autentikasi dan verifikasi role server-side.
- Implementasikan Server Actions untuk operasi tulis.
- Audit error handling, validasi, izin akses, dan cache invalidation.
- Pastikan setiap mutasi memiliki otorisasi tersendiri.

### Tahap 4 — Area publik
Implementasikan beranda, panduan, dokumentasi, informasi calon, kontak, dan pencatatan trafik sesuai schema.

### Tahap 5 — Area panitia
Implementasikan login, proteksi route, dashboard, CRUD panduan, CRUD dokumentasi, CRUD calon, pesan kontak, dan halaman akun.

### Tahap 6 — Integrasi dan kualitas
- Integrasikan komponen bersama dan navigasi.
- Pastikan semua tautan dan tombol melakukan tindakan nyata.
- Uji validasi, loading, empty, error, success, dan akses ditolak.
- Uji layout pada ukuran mobile, tablet, dan desktop.
- Periksa log dan console untuk error yang relevan.

### Tahap 7 — Verifikasi akhir
- Jalankan perintah lint/build yang benar-benar tersedia di `package.json`.
- Perbaiki error yang diperkenalkan oleh perubahan.
- Jangan mengklaim perintah lulus jika tidak dijalankan.
- Buat ringkasan implementasi, file utama yang diubah, hasil pemeriksaan, kebutuhan environment, dan blocker yang masih ada.

## 17. Kriteria Penerimaan (Definition of Done)

Pekerjaan dianggap selesai hanya jika kriteria berikut dipenuhi atau sisa yang belum terpenuhi dijelaskan secara eksplisit.

### Fungsional
- [ ] Beranda publik berfungsi dan navigasi menuju semua halaman utama bekerja.
- [ ] Panduan dibaca dari Supabase dan menampilkan relasi kategori/isi dengan benar.
- [ ] Video panduan hanya ditampilkan dari URL/ID YouTube yang valid.
- [ ] Dokumentasi dibaca dari tabel yang telah diverifikasi dan tautan Drive dapat dibuka.
- [ ] Halaman calon menampilkan hanya data yang tersedia pada schema.
- [ ] Form kontak melakukan validasi server-side dan menyimpan pesan ke Supabase.
- [ ] Login panitia menggunakan Supabase Auth.
- [ ] Halaman privat terlindungi oleh pemeriksaan sesi server-side.
- [ ] Setiap operasi tulis memvalidasi izin berdasarkan role.
- [ ] CRUD panduan, dokumentasi, dan calon berjalan untuk role yang berwenang.
- [ ] Dashboard menggunakan data nyata, bukan angka statis.
- [ ] Halaman kontak panitia menampilkan pesan yang tersimpan.
- [ ] Logout dan penanganan sesi tidak valid berjalan dengan baik.

### Keamanan
- [ ] Tidak ada secret atau service-role key yang terekspos ke client.
- [ ] Semua Server Action privat melakukan validasi sesi dan role.
- [ ] Input divalidasi di server.
- [ ] Error internal tidak dibocorkan ke pengunjung.
- [ ] RLS dan kebijakan akses yang relevan telah diaudit atau kekurangannya didokumentasikan.
- [ ] Tidak ada akses admin yang hanya dilindungi oleh UI.
- [ ] Form publik mempunyai perlindungan spam yang sesuai kemampuan proyek.

### UI/UX
- [ ] Tampilan publik mobile-first dan panel panitia desktop-first, keduanya responsif.
- [ ] Tidak ada horizontal overflow yang tidak disengaja.
- [ ] Loading, empty, error, dan success state tersedia.
- [ ] Form memiliki label dan feedback validasi.
- [ ] Gaya visual profesional, konsisten, dan tidak berlebihan.
- [ ] Tidak ada tombol atau link utama yang sekadar dekoratif.

### Kualitas teknis
- [ ] Kode menggunakan JavaScript `.js`, bukan TypeScript.
- [ ] Mengikuti struktur dan helper yang telah disediakan bila relevan.
- [ ] Tidak ada dependency baru tanpa alasan.
- [ ] Tidak ada error build/lint yang diketahui akibat implementasi; bila ada blocker lingkungan atau baseline, dokumentasikan secara spesifik.
- [ ] Ringkasan akhir menyebutkan apa yang benar-benar dibuat dan apa yang belum bisa diverifikasi.

## 18. Format Laporan Setelah Implementasi

Setelah pekerjaan selesai, berikan laporan ringkas dengan bagian berikut:

1. **Ringkasan:** apa yang sudah diimplementasikan.
2. **Halaman dan fitur:** daftar route dan fungsi yang selesai.
3. **Backend/database:** Server Actions, query, validasi, dan kebijakan akses yang diterapkan.
4. **File utama:** file yang dibuat/diubah dan tujuannya.
5. **Verifikasi:** perintah yang dijalankan dan hasil aktualnya.
6. **Environment:** nama variabel yang dibutuhkan, tanpa menampilkan nilainya.
7. **Blocker atau migrasi:** masalah schema/RLS/konfigurasi yang masih membutuhkan keputusan atau tindakan manual.
8. **Status:** bedakan dengan jujur antara selesai, sebagian, dan belum dikerjakan.

## 19. Instruksi Penutup untuk AI Agent

Mulai dengan membaca dan mengaudit file proyek, bukan langsung menulis ulang seluruh aplikasi. `AGENTS.md` adalah acuan struktur dan aturan teknis; `task-ai.md` ini adalah acuan tujuan produk, perilaku fitur, keamanan, UI/UX, dan kriteria selesai.

Jangan:
- Mengarang informasi resmi pemilu atau data kandidat.
- Membuat fitur voting elektronik tanpa schema, aturan, dan persetujuan yang jelas.
- Mengganti database, framework, bahasa, atau struktur inti tanpa alasan kuat.
- Mengubah RLS menjadi terbuka demi memudahkan implementasi.
- Menggunakan mock data sebagai pengganti integrasi database tanpa penanda yang jelas.
- Mengklaim tes/build berhasil jika tidak dijalankan.
- Menghapus file atau data yang sudah ada tanpa memahami fungsinya.
- Membuat semua komponen menjadi client-side tanpa kebutuhan.
- Menyelesaikan hanya sisi visual sementara tombol dan alur data tidak berfungsi.

Prioritas utama adalah menghasilkan website informasi KPU yang dapat digunakan, aman sesuai kemampuan schema yang tersedia, mudah dikelola panitia, responsif, dan siap dikembangkan lebih lanjut tanpa mengarang fitur yang belum didukung sistem.

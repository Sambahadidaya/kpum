# INSTRUKSI UTAMA UNTUK AI AGENT (CODING ASSISTANT)

Kamu adalah AI Web Developer Expert yang bertugas memprogram proyek "Website KPU Pemilu Presiden Mahasiswa (BEM)".

---

## 1. KONDISI PROJECT SAAT INI (CONTEXT)

### A. Environment & Library Terinstal

Proyek ini menggunakan Next.js (App Router) berbasis JavaScript murni (bukan TypeScript). Dependencies berikut sudah diinstal sempurna:

```json
{
  "dependencies": {
    "@fortawesome/fontawesome-free": "^7.3.1",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.117.3",
    "lucide-react": "^1.58.0",
    "nanoid": "^6.0.2",
    "next": "16.4.1",
    "next-themes": "^0.4.6",
    "openai": "^7.34.0",
    "react": "19.3.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "19.3.0",
    "react-markdown": "^10.1.0"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "^4",
    "babel-plugin-react-compiler": "1.0.0",
    "tailwindcss": "^4"
  }
}
```

---

### B. Konfigurasi Database Supabase yang Sudah Aktif

```sql
-- ==============================================================================
-- SKEMA LENGKAP DATABASE SUPABASE - KPU PEMILU PRESMA POLITEKNIK LP3I
-- Jalankan skrip ini langsung di Supabase SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL ROLE ADMIN
CREATE TABLE IF NOT EXISTS roleAdmin (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  role varchar(50) NOT NULL UNIQUE,
  roleAkses TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE roleAdmin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all roleAdmin" ON roleAdmin;
CREATE POLICY "auth all roleAdmin" ON roleAdmin FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public read roleAdmin" ON roleAdmin;
CREATE POLICY "public read roleAdmin" ON roleAdmin FOR SELECT TO public USING (true);

-- 3. TABEL ADMIN PANITIA
CREATE TABLE IF NOT EXISTS adminPanitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  auth_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roleAdmin(id) ON DELETE CASCADE,
  nama varchar(100),
  nim varchar(50) UNIQUE,
  email varchar(100) UNIQUE,
  no_tlpn varchar(25),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE adminPanitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all adminPanitia" ON adminPanitia;
CREATE POLICY "auth all adminPanitia" ON adminPanitia FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. TABEL PANDUAN & ISI PANDUAN
CREATE TABLE IF NOT EXISTS panduan (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  judul varchar(100) NOT NULL,
  urutan int DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE panduan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read panduan" ON panduan;
CREATE POLICY "public read panduan" ON panduan FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all panduan" ON panduan;
CREATE POLICY "auth all panduan" ON panduan FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS isi_panduan (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  judul_panduan_id uuid NOT NULL REFERENCES panduan(id) ON DELETE CASCADE,
  sub_judul varchar(150),
  isi TEXT,
  link_vidio varchar(255),
  urutan int DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE isi_panduan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read isi_panduan" ON isi_panduan;
CREATE POLICY "public read isi_panduan" ON isi_panduan FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all isi_panduan" ON isi_panduan;
CREATE POLICY "auth all isi_panduan" ON isi_panduan FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. TABEL DOKUMENTASI
CREATE TABLE IF NOT EXISTS dukomentasi (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  judul_dokumentasi varchar(150) NOT NULL,
  tanggal_dokumentasi date DEFAULT CURRENT_DATE,
  link_drive varchar(255),
  deskripsi text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dukomentasi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read dukomentasi" ON dukomentasi;
CREATE POLICY "public read dukomentasi" ON dukomentasi FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all dukomentasi" ON dukomentasi;
CREATE POLICY "auth all dukomentasi" ON dukomentasi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. TABEL TRAFIK
CREATE TABLE IF NOT EXISTS trafik (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  ip_address varchar(50),
  isp varchar(100),
  kota varchar(100),
  negara varchar(100),
  sumber varchar(100),
  referrer varchar(255),
  path varchar(100),
  user_agent text,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE trafik ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public insert trafik" ON trafik;
CREATE POLICY "public insert trafik" ON trafik FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "auth all trafik" ON trafik;
CREATE POLICY "auth all trafik" ON trafik FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. TABEL KONTAK
CREATE TABLE IF NOT EXISTS kontak (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  nama varchar(100),
  email_or_notelp varchar(100) NOT NULL,
  jenis_kontak varchar(20) DEFAULT 'whatsapp',
  pesan_kontak text NOT NULL,
  status varchar(20) DEFAULT 'belum_dibaca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kontak ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public insert kontak" ON kontak;
CREATE POLICY "public insert kontak" ON kontak FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "auth all kontak" ON kontak;
CREATE POLICY "auth all kontak" ON kontak FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. TABEL DETAIL KANDIDAT & KANDIDAT
CREATE TABLE IF NOT EXISTS detail_kandidat (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  notlpn_wa_kandidat varchar(25),
  emailplb_kandidat varchar(100),
  cv_portofolio_kandidat varchar(255),
  visi text,
  misi text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE detail_kandidat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read detail_kandidat" ON detail_kandidat;
CREATE POLICY "public read detail_kandidat" ON detail_kandidat FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all detail_kandidat" ON detail_kandidat;
CREATE POLICY "auth all detail_kandidat" ON detail_kandidat FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS kandidat (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  detail_kandidat_id uuid REFERENCES detail_kandidat(id) ON DELETE SET NULL,
  nama_kandidat varchar(100) NOT NULL,
  nim_kandidat varchar(20) NOT NULL,
  prodi_kandidat varchar(100) NOT NULL,
  fotodiri_kandidat varchar(255),
  posisi varchar(50) DEFAULT 'Calon Presiden Mahasiswa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kandidat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read kandidat" ON kandidat;
CREATE POLICY "public read kandidat" ON kandidat FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all kandidat" ON kandidat;
CREATE POLICY "auth all kandidat" ON kandidat FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. TABEL PASLON
CREATE TABLE IF NOT EXISTS paslon (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  nomor_urut int,
  kandidat1_id uuid NOT NULL REFERENCES kandidat(id) ON DELETE CASCADE,
  kandidat2_id uuid REFERENCES kandidat(id) ON DELETE CASCADE,
  slogan varchar(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE paslon ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read paslon" ON paslon;
CREATE POLICY "public read paslon" ON paslon FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all paslon" ON paslon;
CREATE POLICY "auth all paslon" ON paslon FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. SETUP SUPABASE STORAGE BUCKET: 'kandidat'
-- Membuat bucket kandidat bila belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('kandidat', 'kandidat', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy Storage: Public Read
DROP POLICY IF EXISTS "Public View Kandidat Bucket" ON storage.objects;
CREATE POLICY "Public View Kandidat Bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'kandidat');

-- Policy Storage: Authenticated / Service Role Upload & Manage
DROP POLICY IF EXISTS "Authenticated Upload Kandidat Bucket" ON storage.objects;
CREATE POLICY "Authenticated Upload Kandidat Bucket" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'kandidat') WITH CHECK (bucket_id = 'kandidat');

-- 11. SEED DEFAULT ROLE ADMIN
INSERT INTO roleAdmin (id, role, roleAkses)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'superAdmin', 'all,akun,dashboard,kandidat,dokumentasi,panduan,contact'),
  ('b0000000-0000-0000-0000-000000000002', 'adminPanitia', 'dashboard,kandidat,dokumentasi,panduan,contact')
ON CONFLICT (role) DO UPDATE SET roleAkses = EXCLUDED.roleAkses;

-- 12. SEED CONTOH PANDUAN AWAL
INSERT INTO panduan (id, judul, urutan)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Tahapan & Jadwal Pemilu BEM', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Tata Cara Pemungutan Suara', 2)
ON CONFLICT DO NOTHING;

INSERT INTO isi_panduan (judul_panduan_id, sub_judul, isi, link_vidio, urutan)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Sosialisasi & Pendaftaran', 'Pendaftaran pasangan calon presiden dan wakil presiden mahasiswa dibuka untuk seluruh mahasiswa aktif Politeknik LP3I yang memenuhi kriteria administrasi.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Masa Kampanye & Debat', 'Masa kampanye dilaksanakan secara terbuka dan tertib, diikuti dengan agenda Debat Terbuka Kandidat di Aula Kampus.', NULL, 2),
  ('c0000000-0000-0000-0000-000000000002', 'Persyaratan Pemilih Tetap', 'Setiap mahasiswa aktif Politeknik LP3I yang terdaftar pada DPT berhak memberikan 1 (satu) hak suara dengan menunjukkan Kartu Tanda Mahasiswa (KTM).', NULL, 1)
ON CONFLICT DO NOTHING;

-- 13. SEED DOKUMENTASI CONTOH
INSERT INTO dukomentasi (judul_dokumentasi, tanggal_dokumentasi, link_drive, deskripsi)
VALUES
  ('Sosialisasi Pemilu Raya Mahasiswa LP3I', CURRENT_DATE - INTERVAL '10 day', 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ', 'Dokumentasi kegiatan sosialisasi tata cara pemilu dan pengenalan KPU Mahasiswa.'),
  ('Debat Kandidat Calon Presiden Mahasiswa', CURRENT_DATE - INTERVAL '3 day', 'https://drive.google.com/drive/folders/1zYxWvUtSrQpOnMlKjIhGfEdCbA', 'Dokumentasi adu gagasan dan penyampaian visi misi calon di hadapan mahasiswa LP3I.')
ON CONFLICT DO NOTHING;

-- CATATAN BUAT SUPERADMIN PERTAMA:
-- Untuk membuat akun SuperAdmin pertama:
-- 1. Buat user di menu Authentication > Users di Supabase:
--    Email: superadmin@lp3i.ac.id
--    Password: [password_anda]
-- 2. Ambil User UID (auth_id) hasil generate Supabase Auth.
-- 3. Jalankan query berikut:
--    INSERT INTO adminPanitia (auth_id, role_id, nama, nim, email, no_tlpn)
--    VALUES (
--      '[PASTE_AUTH_UID_DISINI]',
--      'a0000000-0000-0000-0000-000000000001', -- id superAdmin
--      'Super Administrator KPU',
--      'KPU-SUPER-01',
--      'superadmin@lp3i.ac.id',
--      '081234567890'
--    );

CREATE TABLE IF NOT EXISTS panitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  nama_panitia varchar(100) NOT NULL,
  prodi_panitia varchar(100) NOT NULL,
  jabatan_panitia varchar(100) NOT NULL,
  foto_panitia varchar(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

alter table panitia add column bg_image varchar(255);
alter table panitia add column sub_jabatan_panitia varchar(255);

ALTER TABLE panitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read panitia" ON panitia;
CREATE POLICY "public read panitia" ON panitia FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all panitia" ON panitia;
CREATE POLICY "auth all panitia" ON panitia FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS sosmed_panitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  panitia_id uuid not null references panitia(id) on delete cascade,
  whatsapp varchar(255),
  instagram varchar(255),
  threads varchar(255),
  tiktok varchar(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sosmed_panitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read sosmed_panitia" ON sosmed_panitia;
CREATE POLICY "public read sosmed_panitia" ON sosmed_panitia FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all sosmed_panitia" ON sosmed_panitia;
CREATE POLICY "auth all sosmed_panitia" ON sosmed_panitia FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Membuat bucket panitia
INSERT INTO storage.buckets (id, name, public)
VALUES ('panitia', 'panitia', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy Storage: Public Read
DROP POLICY IF EXISTS "Public View panitia Bucket" ON storage.objects;
CREATE POLICY "Public View panitia Bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'panitia');

-- Policy Storage: Authenticated / Service Role Upload & Manage
DROP POLICY IF EXISTS "Authenticated Upload panitia Bucket" ON storage.objects;
CREATE POLICY "Authenticated Upload panitia Bucket" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'panitia') WITH CHECK (bucket_id = 'panitia');


ALTER TABLE kandidat 
ADD COLUMN IF NOT EXISTS is_eliminated BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS trafik_setting (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auto_delete_enabled BOOLEAN DEFAULT FALSE,
  interval_hari INT DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE trafik_setting ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all trafik_setting" ON trafik_setting;
CREATE POLICY "auth all trafik_setting" ON trafik_setting 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default setting
INSERT INTO trafik_setting (auto_delete_enabled, interval_hari)
VALUES (false, 7)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS jadwal_acara (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul_acara VARCHAR(200) NOT NULL,
  tanggal_mulai TIMESTAMP WITH TIME ZONE,
  tanggal_selesai TIMESTAMP WITH TIME ZONE,
  lokasi VARCHAR(200),
  deskripsi TEXT,
  status VARCHAR(30) DEFAULT 'akan_datang', -- 'akan_datang' | 'berlangsung' | 'selesai'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE jadwal_acara ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read jadwal_acara" ON jadwal_acara;
CREATE POLICY "public read jadwal_acara" ON jadwal_acara 
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all jadwal_acara" ON jadwal_acara;
CREATE POLICY "auth all jadwal_acara" ON jadwal_acara 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS mhs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nim VARCHAR(200) NOT NULL,
  nama_mhs VARCHAR(200) NOT NULL,
  kode_voting VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE mhs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read mhs" ON mhs;
CREATE POLICY "public read mhs" ON mhs 
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all mhs" ON mhs;
CREATE POLICY "auth all mhs" ON mhs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS voting (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  nim uuid NOT NULL references mhs(id) on delete cascade, 
  paslon_id uuid NOT NULL references paslon(id) on delete cascade,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE voting ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public insert voting" ON voting;
CREATE POLICY "public insert voting" ON voting FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "auth all voting" ON voting;
CREATE POLICY "auth all voting" ON voting FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS trafik_sosmed (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  sosmed_id uuid NOT NULL references sosmed_panitia(id) on delete cascade, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE trafik_sosmed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public insert trafik_sosmed" ON trafik_sosmed;
CREATE POLICY "public insert trafik_sosmed" ON trafik_sosmed FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "auth all trafik_sosmed" ON trafik_sosmed;
CREATE POLICY "auth all trafik_sosmed" ON trafik_sosmed FOR ALL TO authenticated USING (true) WITH CHECK (true);

```
### C. Struktur Folder Project Eksisting
```C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu
├── src
│   ├── api
│   │   ├── openai
│   │   │   └── route.js
│   │   ├── panitia
│   │   │   ├── auth.js
│   │   │   ├── kandidat.js
│   │   │   ├── contact.js
│   │   │   ├── dashboard.js
│   │   │   ├── dokumentasi.js
│   │   │   ├── login.js
│   │   │   ├── panduan.js
│   │   │   └── rolePanitia.js
│   │   ├── publlic
│   │   │   ├── kandidat.js
│   │   │   ├── contact.js
│   │   │   ├── dokumentasi.js
│   │   │   ├── panduan.js
│   │   │   └── trafik.js
│   │   └── storage.js
│   ├── app
│   │   ├── (portal)
│   │   │   ├── kandidat
│   │   │   │   └── page.js
│   │   │   ├── contact
│   │   │   │   └── page.js
│   │   │   ├── dokumentasi
│   │   │   │   └── page.js
│   │   │   ├── panduan
│   │   │   │   └── page.js
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── panitia
│   │   │   ├── akun
│   │   │   │   └── page.js
│   │   │   ├── kandidat
│   │   │   │   └── page.js
│   │   │   ├── contact
│   │   │   │   └── page.js
│   │   │   ├── dashboard
│   │   │   │   └── page.js
│   │   │   ├── dokumentasi
│   │   │   │   └── page.js
│   │   │   ├── login
│   │   │   │   └── page.js
│   │   │   ├── panduan
│   │   │   │   └── page.js
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── globals.css
│   │   └── layout.js
│   ├── aseets
│   │   └── logo.png
│   ├── components
│   │   ├── ClientTracker.js
│   │   ├── DynamicFavicon.js
│   │   ├── SamsAsisten.js
│   │   ├── SiteBackground.js
│   │   ├── ThemeToggle.js
│   │   ├── panitia
│   │   │   ├── navbar.js
│   │   │   └── tombol.js
│   │   └── public
│   │       ├── bgWaveDivider.js
│   │       ├── navbar.js
│   │       └── tombol.js
│   ├── data
│   │   └── faqDataAi.js
│   ├── lib
│   │   ├── adminRoleData.js
│   │   ├── openai.js
│   │   ├── siteThemes.js
│   │   └── supabase.js
│   ├── scurity
│   │   ├── rateLimiter.js
│   │   └── sanitaze.js
│   ├── utils
│   │   ├── dateUtils.js
│   │   ├── driveUtils.js
│   │   ├── supabaseUtils.js
│   │   └── youtubeUtils.js
│   └── proxy.js
├── .env.local
├── .gitignore
├── AGENTS.md
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
└── README.md
```

## 2. ATURAN KODE

### 1. No TypeScript: Gunakan ES6 JavaScript murni (.js).
### 2. Gunakanlah Server Action jangan pakai RestAPI
### 3. Gunakanlah 'use client' dan 'use server' untuk memisahkan client dan server.
### 4. memakai tailwind sebagai css utama.
### 5. Untuk api semuanya dikumpulkan di src/api/ karna saya ingin pakai use server atau server action.

## 3. ATURAN PROJEK

### 1. Database memakai supabase. dan pakai supabaseUtils.js karna saya tidak ingin url atau link supabasenya langsung tereksport ke client tapi di atur dibackend yang use server
### 2. Deploy memakai vercel.
### 3. Video panduan memakai video youtube. dan pakai @youtubeUtils.js
### 4. pastikan web sudah responsif antara ukuran Desktop dan Mobile
### 5. untuk halaman '/(portal)/' tampilan mobile first (utamakan desain untuk mobile) dan juga responsive
### 6. untuk halaman '/panitia/' tampilan desktop first (utamakan desain untuk desktop) dan juga responsive
### 7. untuk dokumentasi memakai google drive untuk penyimpanan filenya dan pakai @driveUtils.js
### 8. tampilan desainnya jangan mencolok ai slopnya seperti hindarilah icon "spark" atau hidarilah banyak warna dan lain lainnya
### 9. untuk icon biasa pakai lucide-react dan untuk icon sosial media memakai fontawesome

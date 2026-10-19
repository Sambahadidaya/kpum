fokus ke halaman public, saya ingin membuat halaman baru yaitu untuk e-voting yang halaman itu ada 2 halaman yaitu halaman login terus halaman voting yang foldernya dan filenya sudah aku persiapkan di src/app/(portal)/voting/login/page.js dan src/app/(portal)/voting/voting/page.js dan src/app/(portal)/voting/page.js, yang saya ingin halaman src/app/(portal)/voting/voting/page.js itu bisa diakses ketika sudah login di src/app/(portal)/voting/login/page.js, pada saat voting itu tiap mahasiswa cuman bisa 1 kali voting dan ketika sudah pernah voting maka tidak bisa login lagi. terus untuk halaman login divoting itu terdiri dari inputan nama,nim,dan kode yang datanya didapat dari tabel mhs didatabase. dikarnakan ada halaman baru maka navbar pada tampilan mobile tepatnya yang link dokumentasi itu disimpan di ul informasi dan link voting ini saya ingin letaknya ditengah tengah yang link panitia digeser ke kanan, jadi link votingnya berada diantara kandidat dan panitia.
terus dihalaman panitia saya ingin ada ul baru yaitu bernama data mhs yang didalam ul itu ada 2 halaman baru yaitu halaman manajemen data mhs dan dashboard yang dashboard itu memperlihatkan mana yang sudah voting mana yang belum dan analisis lengkap lainnya. yang untuk halaman manajemen data mhs itu bisa diinput manual atau bisa juga dengan mengupload file exsel lalu diproses file exselnya menjadi berupa data mhs yang siap dikirim ke database supabase. yang untuk halaman dashboard itu desainnya tidak sama seperti dashboard utama dan untuk halaman manajemen data mhs itu desainnya sama seperti panitia/akun/ cuman ada fitur upload exsel dan sesuaikan juga tabel halamannya.
terus dihalaman panitia juga saya ingin membuat ul baru lagi yaitu bernama voting, yang isinya berupa 2 halaman yaitu halaman dashboard dan halaman manajemen voting, untuk halaman dashboard itu isinya berupa statistik jumlah voting, grafik suara untuk tiap tiap paslon, terus grafik perbandingan suara antar paslon, dan analisis detail lainnya. terus yang untuk halaman manajemen voting itu terdiri dari tabel semua voting yang sudah masuk yang juga menampilkan informasi nama,nim,kode,paslon yang dipilih, dan juga tombol lihat foto paslon yang dipilih.
dan saya sudah membuat dan menjalankan sql ini 
```sql

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
```
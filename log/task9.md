dihalaman panitia saya ingin ada ul baru yaitu bernama sekretaris dan disekretaris itu ada 3 halaman baru yaitu dashboard, judul absensi panitia dan absensi panitia.
yang untuk halaman dashbordnya saya ingin desainnya seperti halaman /panitia/dashboard, terus untuk halaman judul absensi panitia saya ingin desainnya seperti /panitia/akun. dan kalau untuk halaman absensi panitia itu saya ingin desainnya seperti /panitia/akun cuman didalam tabelnya itu tepatnya diujung row ada penjumlahan berapa yang hadir, berapa yang sakit, berapa yang izin dan berapa yang alpha, terus diatas tabelnya itu saya ingin ada filter dari judul absensinya dengan defaultnya gak memilih dan tabel atau data atau tambah absensi bisa dimunculkan ketika sudah memilih filter absensi itu. terus pada saat tambah absensi pada modalnya saya ingin judul absensinya berupa search dropdown ul li yang defaultnya pada filter tadi terus pada inputan memilih panitia itu juga berupa search dropdown ul li, dan panitia itu bisa dipilih ketika belum absensi dijudul absensi itu jadi pada satu judul absensi panitia cuman bisa 1 kali absensi, terus ada juga tombol untuk mengedit absensi panitia tapi hanya bisa mengedit jenis absensinya dan keterangan dan keterlambatan, terus pada saat mengedit tidak bisa  mengubah judul absensinya dan nama panitianya.
saya sudah membuat atau menjalankan sql berikut didatabase ;

```sql
CREATE TABLE IF NOT EXISTS judul_absensi_panitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  judul_absensi_panitia varchar(200) NOT NULL,
  created_at date DEFAULT CURRENT_DATE
);

ALTER TABLE judul_absensi_panitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all judul_absensi_panitia" ON judul_absensi_panitia;
CREATE POLICY "auth all judul_absensi_panitia" ON judul_absensi_panitia FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS absensi_panitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  panitia_id uuid NOT NULL references panitia(id) on delete cascade, 
  judul_absensi_panitia_id uuid NOT NULL references judul_absensi_panitia(id) on delete cascade, 
  jenis_absensi varchar(100) not null check (jenis_absensi in ('hadir', 'izin', 'sakit', 'alpha')),
  keterlambatan varchar(255) not null check (keterlambatan in ('terlambat', 'tepat_waktu')),
  keterangan varchar(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE absensi_panitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all absensi_panitia" ON absensi_panitia;
CREATE POLICY "auth all absensi_panitia" ON absensi_panitia FOR ALL TO authenticated USING (true) WITH CHECK (true);
```
fokus ke halaman public struktur-panitia.
dihalaman itu saya ingin kalau untuk tampilan mobile itu tetep berupa card cuman yang tampilannya 100vw saja, terus jika tampilannya didestop maka cardnya itu dalam 100vw ada 2 card yang muncul jadi perbesarlah card pada tampilan destopnya, terus saya ingin pada bg cardnya itu bisa pake gambar yang diupload dihalaman admin atau panitia yang gambarnya aga transaparan sekitar transparannya 60% dan bg gambar ini cuman opsional,terus saya ingin ada sub_jabatannya dan dibawah nama panitia itu saya juga ingin ada sosmed panitianya itu juga jika memang ada atau jika memang diisi, dan icon sosmednya menyesuaikan dengan sosmednya apa (instagram,tiktok,wa,threeads), terus fotodiri panitia itu saya juga ingin support png. terus saya ingin menghapus teks yang panitia resmi itu dan ingin menggantinya menjadi perbesar card agar full screen dan jangan pakai warna hijau tapi pakailah warna netral sesuai dengan darkmode atau lighmode
terus pada halaman panitianya saya ingin pada saat pembuatan panitia itu tepatnya pada saat mengupload gambar mau itu gambar fotodiri atau gambar bg itu ada verifikasi cropnya dulu apakah sudah sesuai atau belum, jadi tampilan rasio card panitianya memang difixkan cuman ukurannya saja yang menyesuaiikan, jadi ketika mengedit crop gambar juga akan sama mau itu tampilan mobile atau destop.
dan saya sudah menjalankan sql ini ;
```sql
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

alter table panitia add column bg_image varchar(255);
alter table panitia add column sub_jabatan_panitia varchar(255);
```
fokus ke pembahasan berikut! 
saya ingin ada halaman baru yaitu untuk daftar panitia yang desainnya saya ingin semodern mungkin dengan tata letaknya saya ingin jika pada tampilan destop itu disebelah kiri ada nama,prodi, dan jabatan panitia dan disebelah kanan div itu ada div foto panitianya, terus jika pada tampilan mobile itu saya ingin diatas ada foto panitianya terus dibawahnya ada nama,prodi, dan jabatan panitianya. terus untuk mengaturnya tetep dihalaman panitia tepatnya pada bagian panitia dan saya sudah membuat atau menjalankan sql berikut ;
```sql

CREATE TABLE IF NOT EXISTS panitia (
  id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  nama_panitia varchar(100) NOT NULL,
  prodi_panitia varchar(100) NOT NULL,
  jabatan_panitia varchar(100) NOT NULL,
  foto_panitia varchar(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE panitia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read panitia" ON panitia;
CREATE POLICY "public read panitia" ON panitia FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all panitia" ON panitia;
CREATE POLICY "auth all panitia" ON panitia FOR ALL TO authenticated USING (true) WITH CHECK (true);

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
```
yang untuk background utamanya tetep pakai bgwavedivider terus untuk card atau foto panitia itu saya juga ingin ada 3dnya dengan defaultnya 3d juga 

dan saya juga sudah membuat file berikut ;
src/api/panitia/panitia.js terus src/api/public/panitia.js terus src/app/panitia/panitia/page.js dan src/app/(portal)/panitia/page.js
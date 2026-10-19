dihalaman panitia saya ingin ada ul baru yaitu bernama data panitia yang isinya halaman panitia/panitia itu dipindahkan ke ul baru ini dan saya ingin ada halaman baru yaitu untuk trafik sosmed panitia yang trafik ini  saya ingin halamannya seperti trafik kunjungan yang ada anlisis lengkapnya dan saya sudah membuat atau menjalankan sql berikut ;
```sql
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
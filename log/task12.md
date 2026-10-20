fokus ke halaman panitia, saya ingin diul voting itu ada li baru yaitu untuk mengatur jadwal votingnya, yang mana desainnya seperti halaman panitia voting lainnya, terus saya ingin dihalaman public voting saat login itu tombol masuk dan inputannya ketika waktu votingnya belum dimulai atau sudah selesai maka tombol masuk dan inputannya menjadi disable dan ketika mencoba mengklik itu akan ada pemberitahuan notifikasi muncul yang notifikasi ini saya ingin bener bener notifikasi yang pop up muncul bukan pakai alert, dan dibawah tombol masuk itu ada waktu hitung mundurnya jika sudah selesai maka waktunya akan bertuliskan selesai. dan pastikan halaman login ini waktunya mengikuti waktu saat ini dan pakai scurity berlapis agar ketika user mencoba mengubah waktu didevicenya atau menggunakan vpn itu tidak bisa mengaksesnya.
terus dihalaman panitia tepatnya pada halaman /panitia/mhs itu ada kolom baru yaitu kolom kelas jadi tambahkanlah kolom kelas pada tabelnya dan pada settingan saat mengupload exsel itu, terus saya ingin ditabelnya ada kolom baru lagi yaitu kolom angkatan dan prodi yang khusus untuk angkatan dan prodi itu diambilnya dari memecah nim dengan kalau angkatan itu dari 4angka awal nim kalau prodi itu 2angka setelah angkatan yang khusus untuk prodi itu terdiri dari (01=Administrasi Bisnis, 02=Manajemen Informatika, 03=Akuntansi, 04=Hubungan Masyarakat,41=Bisnis Digital,42=Akuntansi Perpajakan) yang kolom angkatan dan prodi ini hanya berlaku jika kolom kelasnya berisi Reg dan NonReg karna kalau selain itu isinya samain saja dengan kelas tersebut. terus pada halaman panitia/mhs/dashboard saya ingin ada analisis lagi dari kolom baru yang sudah dibahas tadi dan pada Total data mau itu yang sudah memilih atau yg belum memilih itu juga ada analisis lengkap lagi yang. terus dihalaman panitia/mhs/dashboard ataupun di /panitia/mhs itu saya ingin ada filter untuk memecah lagi datanya yang filter itu berupa dropdown ul li dan ketika memilih filter itu data yang dimuat dihalaman itu akan disesuaikan lagi. terus saya ingin halaman mhs ataupun voting itu datanya diambil/querynya 1 kali saja pada saat pertama kali dibuka dan akan disimpan dilocalstrage agar performa websitenya meningkat dan bisa diperbarui ketika mengklik perbarui data saja dan localstorage ini akan diriset ketika keluar dari website atau pindah tab atau apapun itu seperti pada logika update status admin yang AdminPresenceTracker. terus dihalaman panitia ini teks header seperti Panel Panitia KPU Mahasiswa superAdmin itu malah terhalang sama navbar.
terus pada halaman roleakses itu saya ingin ada roleakses khusus untuk bisa akses halaman tertentu seperti roleakses ini tapi cuman bisa lihat saja dan tidak bisa apapun jadi bener bener cuman view saja bukan editor. untuk roleakses khusus ini jenisnya akan jadi "Viewer" sedangkan untuk yang sekarang saya gunakan adalah "Editor".

dan saya sudah membuat dan menjalankan sql berikut ;
```sql
CREATE TABLE IF NOT EXISTS jadwal_voting (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  waktu_mulai TIMESTAMP WITH TIME ZONE NOT NULL,
  waktu_berakhir TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE jadwal_voting ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read jadwal_voting" ON jadwal_voting;
CREATE POLICY "public read jadwal_voting" ON jadwal_voting 
  FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "auth all jadwal_voting" ON jadwal_voting;
CREATE POLICY "auth all jadwal_voting" ON jadwal_voting 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

alter table mhs add column kelas varchar(50) check (kelas in ('Reg','NonReg','Manaj','Dosen'));

alter table roleadmin add column jenis varchar(50) default 'Editor' check (jenis in ('Viewer','Editor')) ;
```
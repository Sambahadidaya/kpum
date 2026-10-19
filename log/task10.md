pada halaman /panitia/akun itu saya ingin dalam tabelnya ada kolom baru yaitu untuk memperlihatkan apakah admin itu sedang aktif atau ofline. terus saya ingin pada setiap admin logika online atau oflinenya itu yaitu ketika membuka website maka otomatis kolom is_online bernilai true dan ketika adminnya keluar dari website atau menutup website atau berpindah tab itu kolom is_onlinenya menjadi false, jadi intinya kolom is_online itu otomatis bernilai false ketika tidak membuka website itu.
terus pada halaman /panitia/roleakses tepatnya pada modul atau pada saat membuat role baru, kan itu muncul modul modulnya, nah saya ingin memperbarui modul itu karna sekarang sudah ada banyak halaman baru dipanitia.
dan saya sudah menjalankan sql berikut disupabase ;
```sql
alter table adminpanitia add column is_online boolean default false;
```
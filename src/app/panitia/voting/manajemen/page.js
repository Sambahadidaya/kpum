'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPanitiaVotingList, hapusVoting } from '@/api/panitia/voting';
import {
  ClipboardList,
  Vote,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  X,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function ManajemenVotingPanitiaPage() {
  const [votingList, setVotingList] = useState([]);
  const [paslonOptions, setPaslonOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paslonFilter, setPaslonFilter] = useState('semua');

  // Modal Lihat Foto Paslon
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPaslonDetail, setSelectedPaslonDetail] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaVotingList({ search, paslonFilter });
    if (res.success) {
      setVotingList(res.data || []);
      setPaslonOptions(res.paslonOptions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [paslonFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenPhoto = (paslon) => {
    if (!paslon) return;
    setSelectedPaslonDetail(paslon);
    setPhotoModalOpen(true);
  };

  const handleDeleteVote = async (id, namaMhs) => {
    if (
      confirm(
        `Batalkan dan hapus catatan suara pemilih ${namaMhs}? Mahasiswa bersangkutan akan dapat melakukan voting ulang jika diizinkan.`
      )
    ) {
      const res = await hapusVoting(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || 'Gagal menghapus catatan voting.');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header Halaman (Netral) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Manajemen Log Voting Masuk
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold">
              Audit Suara
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Daftar seluruh transaksi suara masuk dari mahasiswa DPT, verifikasi pilihan paslon, dan tinjau foto kandidat.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          title="Perbarui Log Voting"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama mahasiswa, NIM, atau kode voting..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-semibold hidden md:inline">
              Filter Paslon:
            </span>
            <select
              value={paslonFilter}
              onChange={(e) => setPaslonFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer"
            >
              <option value="semua">Semua Pasangan Calon</option>
              {paslonOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Log Voting */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Nama Mahasiswa</th>
                  <th className="py-3.5 px-4 font-semibold">NIM</th>
                  <th className="py-3.5 px-4 font-semibold">Kode Token</th>
                  <th className="py-3.5 px-4 font-semibold">Paslon Terpilih</th>
                  <th className="py-3.5 px-4 font-semibold">Waktu Pencoblosan</th>
                  <th className="py-3.5 px-5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {votingList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      Tidak ada catatan voting yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  votingList.map((v) => {
                    const paslon = v.paslon;

                    return (
                      <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                        <td className="py-3.5 px-5 font-bold text-zinc-900 dark:text-zinc-100">
                          {v.mhs.nama_mhs}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{v.mhs.nim}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                          {v.mhs.kode_voting}
                        </td>
                        <td className="py-3.5 px-4">
                          {paslon ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {paslon.nomor_urut}
                              </span>
                              <div className="truncate max-w-xs">
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                                  Paslon {paslon.nomor_urut}
                                </span>
                                <span className="text-[10px] text-zinc-500 truncate block">
                                  {paslon.kandidat1?.nama_kandidat}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic">Paslon Tidak Ditemukan</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                          {new Date(v.created_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          {paslon && (
                            <button
                              type="button"
                              onClick={() => handleOpenPhoto(paslon)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-semibold text-[11px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                              title="Lihat Foto Paslon"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Foto Paslon</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteVote(v.id, v.mhs.nama_mhs)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer inline-flex items-center"
                            title="Hapus Suara Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lihat Foto Paslon yang Dipilih */}
      {photoModalOpen && selectedPaslonDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedPaslonDetail.nomor_urut}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Pasangan Calon No. {selectedPaslonDetail.nomor_urut}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Foto dan profil kandidat yang dipilih
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Foto Kedua Kandidat Berdampingan */}
            <div className="grid grid-cols-2 gap-4">
              {/* Kandidat 1: Capres */}
              <div className="space-y-2 text-center">
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {selectedPaslonDetail.kandidat1?.fotodiri_kandidat ? (
                    <Image
                      src={selectedPaslonDetail.kandidat1.fotodiri_kandidat}
                      alt={selectedPaslonDetail.kandidat1.nama_kandidat || 'Capres'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white">
                    Calon Presiden
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {selectedPaslonDetail.kandidat1?.nama_kandidat}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {selectedPaslonDetail.kandidat1?.nim_kandidat || '-'}
                  </p>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">
                    {selectedPaslonDetail.kandidat1?.prodi_kandidat || '-'}
                  </p>
                </div>
              </div>

              {/* Kandidat 2: Cawapres */}
              <div className="space-y-2 text-center">
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {selectedPaslonDetail.kandidat2?.fotodiri_kandidat ? (
                    <Image
                      src={selectedPaslonDetail.kandidat2.fotodiri_kandidat}
                      alt={selectedPaslonDetail.kandidat2.nama_kandidat || 'Cawapres'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white">
                    Calon Wakil
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {selectedPaslonDetail.kandidat2?.nama_kandidat || '-'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {selectedPaslonDetail.kandidat2?.nim_kandidat || '-'}
                  </p>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">
                    {selectedPaslonDetail.kandidat2?.prodi_kandidat || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Slogan Paslon */}
            {selectedPaslonDetail.slogan && (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Slogan Paslon</p>
                <p className="text-xs font-medium italic text-zinc-700 dark:text-zinc-300 mt-0.5">
                  "{selectedPaslonDetail.slogan}"
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

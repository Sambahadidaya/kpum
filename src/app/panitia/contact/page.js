'use client';

import { useState, useEffect } from 'react';
import {
  getPanitiaContactList,
  updateStatusKontak,
  hapusPesanKontak,
} from '@/api/panitia/contact';
import { formatWaktuIndo } from '@/utils/dateUtils';
import {
  Mail,
  Search,
  Clock,
  Trash2,
  Send,
  Phone,
} from 'lucide-react';

export default function PanitiaContactPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const res = await getPanitiaContactList();
    if (res.success) {
      setList(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const res = await updateStatusKontak(id, status);
    if (res.success) {
      setList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus pesan kontak ini?')) {
      const res = await hapusPesanKontak(id);
      if (res.success) {
        setList((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(res.error || 'Gagal menghapus pesan.');
      }
    }
  };

  const filteredList = list.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchQuery =
      (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email_or_notelp || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pesan_kontak || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Pesan Masuk & Pengaduan Pemilih
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Daftar pertanyaan dan aduan mahasiswa yang masuk melalui form portal publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Semua ({list.length})
          </button>
          <button
            onClick={() => setFilterStatus('belum_dibaca')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'belum_dibaca'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Belum Dibaca ({list.filter((k) => k.status === 'belum_dibaca').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pesan berdasarkan nama, kontak, atau isi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500"
        />
      </div>

      {/* List Pesan */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto space-y-3">
          <Mail className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tidak Ada Pesan</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery ? 'Tidak ada pesan yang sesuai pencarian.' : 'Belum ada pesan yang masuk dari pengunjung.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const isWA = item.jenis_kontak === 'whatsapp' || !item.email_or_notelp.includes('@');
            const replyUrl = isWA
              ? `https://wa.me/${item.email_or_notelp.replace(/[^0-9]/g, '')}`
              : `mailto:${item.email_or_notelp}`;

            return (
              <div
                key={item.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  item.status === 'belum_dibaca'
                    ? 'bg-white dark:bg-zinc-950 border-zinc-400 dark:border-zinc-700 shadow-sm'
                    : 'bg-zinc-50/70 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                      {isWA ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{item.nama || 'Mahasiswa Anonim'}</span>
                        {item.status === 'belum_dibaca' && (
                          <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                        )}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                        {item.email_or_notelp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatWaktuIndo(item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Pesan Isi */}
                <div className="py-3 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {item.pesan_kontak}
                </div>

                {/* Aksi */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Tombol Balas Cepat */}
                    <a
                      href={replyUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleUpdateStatus(item.id, 'sudah_dibalas')}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Balas via {isWA ? 'WhatsApp' : 'Email'}</span>
                    </a>

                    {item.status === 'belum_dibaca' ? (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'sudah_dibaca')}
                        className="py-1.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition cursor-pointer"
                      >
                        Tandai Dibaca
                      </button>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                        Status: {item.status}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

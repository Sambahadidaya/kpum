'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Languages,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Save,
  Search,
  Filter,
  Copy,
  RefreshCw,
  Globe2,
  X,
  FileText,
} from 'lucide-react';
import {
  getLanguagesList,
  addLanguage,
  deleteLanguage,
  toggleLanguageActive,
  getTranslationsByLanguage,
  bulkSaveTranslations,
  copyTranslationsFromIndonesian,
  upsertTranslation,
  deleteTranslation,
} from '@/api/panitia/translate';

export default function PanitiaTranslatePage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [translations, setTranslations] = useState([]);
  const [editedValues, setEditedValues] = useState({}); // { [key_teks]: string }

  const [loadingLangs, setLoadingLangs] = useState(true);
  const [loadingTrans, setLoadingTrans] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Search & Filter Category
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal Tambah Bahasa
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [newLangForm, setNewLangForm] = useState({
    kode: '',
    nama: '',
    flag: '🌐',
    urutan: 1,
    is_active: true,
    copyFromId: true,
  });

  // Modal Tambah Key Baru
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    key_teks: '',
    value_teks: '',
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Fetch Languages List
  const fetchLanguages = useCallback(async () => {
    setLoadingLangs(true);
    const res = await getLanguagesList();
    if (res.success) {
      setLanguages(res.data || []);
      // Jika bahasa terpilih belum diset atau dihapus, default ke 'en' atau item pertama
      if (!res.data.some((l) => l.kode === selectedLang)) {
        const fallback = res.data.find((l) => l.kode !== 'id') || res.data[0];
        if (fallback) setSelectedLang(fallback.kode);
      }
    }
    setLoadingLangs(false);
  }, [selectedLang]);

  // 2. Fetch Translations for Selected Language
  const fetchTranslations = useCallback(async (kode) => {
    if (!kode) return;
    setLoadingTrans(true);
    const res = await getTranslationsByLanguage(kode);
    if (res.success) {
      setTranslations(res.data || []);
      // Reset edited values mapping
      const initialMap = {};
      (res.data || []).forEach((t) => {
        initialMap[t.key_teks] = t.value_teks || '';
      });
      setEditedValues(initialMap);
    }
    setLoadingTrans(false);
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (selectedLang) {
      fetchTranslations(selectedLang);
    }
  }, [selectedLang, fetchTranslations]);

  // Handle Switch Active Language
  const handleToggleLangActive = async (kode, currentStatus) => {
    const res = await toggleLanguageActive(kode, !currentStatus);
    if (res.success) {
      setLanguages((prev) =>
        prev.map((l) => (l.kode === kode ? { ...l, is_active: !currentStatus } : l))
      );
      showNotification('success', `Status bahasa [${kode.toUpperCase()}] berhasil diubah.`);
    } else {
      showNotification('error', res.error || 'Gagal mengubah status bahasa.');
    }
  };

  // Handle Delete Language
  const handleDeleteLanguage = async (kode, nama) => {
    if (!confirm(`Hapus bahasa ${nama} (${kode}) beserta seluruh terjemahannya?`)) return;

    const res = await deleteLanguage(kode);
    if (res.success) {
      showNotification('success', `Bahasa ${nama} berhasil dihapus.`);
      if (selectedLang === kode) setSelectedLang('id');
      fetchLanguages();
    } else {
      showNotification('error', res.error || 'Gagal menghapus bahasa.');
    }
  };

  // Handle Add Language Submit
  const handleAddLanguageSubmit = async (e) => {
    e.preventDefault();
    if (!newLangForm.kode.trim() || !newLangForm.nama.trim()) {
      showNotification('error', 'Kode dan nama bahasa wajib diisi.');
      return;
    }

    setSaving(true);
    const res = await addLanguage(newLangForm);
    setSaving(false);

    if (res.success) {
      showNotification('success', `Bahasa ${newLangForm.nama} berhasil ditambahkan.`);
      setIsLangModalOpen(false);
      setSelectedLang(newLangForm.kode.toLowerCase());
      fetchLanguages();
    } else {
      showNotification('error', res.error || 'Gagal menambahkan bahasa.');
    }
  };

  // Handle Inline Value Change
  const handleValueChange = (key, val) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Handle Bulk Save Translations
  const handleBulkSave = async () => {
    setSaving(true);
    const entries = Object.entries(editedValues).map(([key_teks, value_teks]) => ({
      key_teks,
      value_teks,
    }));

    const res = await bulkSaveTranslations(selectedLang, entries);
    setSaving(false);

    if (res.success) {
      showNotification('success', `Berhasil menyimpan ${res.count || entries.length} teks terjemahan.`);
      fetchTranslations(selectedLang);
      fetchLanguages();
    } else {
      showNotification('error', res.error || 'Gagal menyimpan terjemahan.');
    }
  };

  // Handle Copy from Indonesian (ID)
  const handleCopyFromIndonesian = async () => {
    if (!confirm(`Salin seluruh teks acuan Bahasa Indonesia (ID) ke bahasa [${selectedLang.toUpperCase()}] untuk key yang belum ada?`)) {
      return;
    }

    setSaving(true);
    const res = await copyTranslationsFromIndonesian(selectedLang);
    setSaving(false);

    if (res.success) {
      showNotification('success', `Berhasil menyalin ${res.copiedCount || 0} key dari Bahasa Indonesia.`);
      fetchTranslations(selectedLang);
      fetchLanguages();
    } else {
      showNotification('error', res.error || 'Gagal menyalin teks terjemahan.');
    }
  };

  // Handle Add New Key Submit
  const handleAddKeySubmit = async (e) => {
    e.preventDefault();
    if (!newKeyForm.key_teks.trim()) {
      showNotification('error', 'Nama key wajib diisi.');
      return;
    }

    setSaving(true);
    // Simpan ke bahasa aktif sekaligus buat di ID jika belum ada
    const res = await upsertTranslation(
      selectedLang,
      newKeyForm.key_teks,
      newKeyForm.value_teks
    );
    setSaving(false);

    if (res.success) {
      showNotification('success', `Key [${newKeyForm.key_teks}] berhasil dibuat.`);
      setIsKeyModalOpen(false);
      setNewKeyForm({ key_teks: '', value_teks: '' });
      fetchTranslations(selectedLang);
    } else {
      showNotification('error', res.error || 'Gagal membuat key baru.');
    }
  };

  // Handle Delete Single Translation Key
  const handleDeleteKey = async (keyTeks) => {
    if (!confirm(`Hapus teks terjemahan untuk key: "${keyTeks}" di bahasa ini?`)) return;

    const res = await deleteTranslation(selectedLang, keyTeks);
    if (res.success) {
      showNotification('success', `Key ${keyTeks} berhasil dihapus.`);
      fetchTranslations(selectedLang);
    } else {
      showNotification('error', res.error || 'Gagal menghapus key.');
    }
  };

  // Filter translations by search & category
  const filteredTranslations = translations.filter((item) => {
    const matchesSearch =
      item.key_teks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (editedValues[item.key_teks] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id_reference || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'all') return true;
    return item.key_teks.startsWith(categoryFilter + '.');
  });

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'nav', label: 'Navbar (nav)' },
    { id: 'hero', label: 'Beranda (hero)' },
    { id: 'kandidat', label: 'Kandidat (kandidat)' },
    { id: 'voting', label: 'Voting (voting)' },
    { id: 'panduan', label: 'Panduan (panduan)' },
    { id: 'dokumentasi', label: 'Dokumentasi (dokumentasi)' },
    { id: 'kontak', label: 'Kontak (kontak)' },
    { id: 'umum', label: 'Umum (umum)' },
  ];

  const currentLangObj = languages.find((l) => l.kode === selectedLang) || {
    kode: selectedLang,
    nama: selectedLang,
    flag: '🌐',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-md">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Manajemen Bahasa & Terjemahan Website
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                SuperAdmin
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kelola multi-bahasa portal publik, tambahkan bahasa baru, dan sesuaikan terjemahan antarmuka secara instan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              fetchLanguages();
              fetchTranslations(selectedLang);
            }}
            disabled={loadingLangs || loadingTrans}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLangs || loadingTrans ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahasa</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left (Daftar Bahasa) - Right (Editor Terjemahan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Daftar Bahasa (4 Kolom di Desktop) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-blue-600" />
                <span>Bahasa Sistem ({languages.length})</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {loadingLangs ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  Memuat daftar bahasa...
                </div>
              ) : (
                languages.map((lang) => {
                  const isSelected = selectedLang === lang.kode;

                  return (
                    <div
                      key={lang.kode}
                      onClick={() => setSelectedLang(lang.kode)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-lg">{lang.flag}</span>
                        <div className="truncate">
                          <p className="text-xs font-bold leading-tight truncate">
                            {lang.nama}
                          </p>
                          <p className={`text-[10px] font-mono ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>
                            Kode: {lang.kode} • {lang.translationCount || 0} teks
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Toggle Status Aktif */}
                        <button
                          type="button"
                          onClick={() => handleToggleLangActive(lang.kode, lang.is_active)}
                          title={lang.is_active ? 'Bahasa Aktif' : 'Bahasa Nonaktif'}
                          className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                            lang.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                              lang.is_active ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Hapus Bahasa (kecuali ID) */}
                        {lang.kode !== 'id' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLanguage(lang.kode, lang.nama)}
                            className={`p-1 rounded-lg transition cursor-pointer ${
                              isSelected
                                ? 'text-zinc-300 hover:text-red-300'
                                : 'text-zinc-400 hover:text-red-600'
                            }`}
                            title="Hapus Bahasa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor Terjemahan (8 Kolom di Desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            {/* Top Bar Editor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentLangObj.flag}</span>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Kamus Terjemahan: {currentLangObj.nama} ({currentLangObj.kode.toUpperCase()})
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {translations.length} kunci terjemahan terdaftar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedLang !== 'id' && (
                  <button
                    onClick={handleCopyFromIndonesian}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition cursor-pointer"
                    title="Otomatis salin key dari ID yang belum ada"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin dari Indonesia</span>
                  </button>
                )}

                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Key Baru</span>
                </button>

                <button
                  onClick={handleBulkSave}
                  disabled={saving || loadingTrans}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-40 transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* Search Key or Value */}
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nama key atau teks terjemahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 pr-2 py-0.5 focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Translation Strings List / Table */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {loadingTrans ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Memuat teks terjemahan...
                </div>
              ) : filteredTranslations.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Tidak ditemukan teks yang sesuai dengan kriteria pencarian.
                </div>
              ) : (
                filteredTranslations.map((item) => {
                  const currentValue = editedValues[item.key_teks] ?? '';
                  const isMissing = !currentValue.trim();

                  return (
                    <div
                      key={item.key_teks}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.key_teks}
                          </span>
                          {isMissing ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              Belum Diterjemahkan
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              Ada Terjemahan
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteKey(item.key_teks)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-600 transition cursor-pointer"
                          title="Hapus Key Terjemahan Ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Indonesian Reference Text */}
                      {selectedLang !== 'id' && item.id_reference && (
                        <div className="text-[11px] text-zinc-500 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400 mr-1.5">
                            🇮🇩 Indonesia:
                          </span>
                          <span>{item.id_reference}</span>
                        </div>
                      )}

                      {/* Translation Input */}
                      <div>
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleValueChange(item.key_teks, e.target.value)}
                          placeholder={`Terjemahan dalam bahasa ${currentLangObj.nama}...`}
                          className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Save Reminder */}
            {filteredTranslations.length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-400">
                  Perubahan tersimpan sementara di form. Klik "Simpan Perubahan" untuk menerapkan ke database publik.
                </span>
                <button
                  onClick={handleBulkSave}
                  disabled={saving || loadingTrans}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-40 transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Bahasa Baru */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <form onSubmit={handleAddLanguageSubmit}>
              <div className="flex items-center justify-between p-4.5 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tambah Bahasa Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Kode ISO (2-5 huruf)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={newLangForm.kode}
                      onChange={(e) =>
                        setNewLangForm({ ...newLangForm, kode: e.target.value.toLowerCase() })
                      }
                      placeholder="Contoh: de, es, ko"
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Emoji Bendera
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={newLangForm.flag}
                      onChange={(e) => setNewLangForm({ ...newLangForm, flag: e.target.value })}
                      placeholder="🇩🇪 / 🇪🇸"
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden text-center text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Nama Bahasa
                  </label>
                  <input
                    type="text"
                    value={newLangForm.nama}
                    onChange={(e) => setNewLangForm({ ...newLangForm, nama: e.target.value })}
                    placeholder="Contoh: Deutsch, Español"
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Urutan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLangForm.urutan}
                    onChange={(e) =>
                      setNewLangForm({ ...newLangForm, urutan: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newLangForm.copyFromId}
                      onChange={(e) =>
                        setNewLangForm({ ...newLangForm, copyFromId: e.target.checked })
                      }
                      className="rounded accent-blue-600"
                    />
                    <span>Otomatis salin seluruh string dari Bahasa Indonesia</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newLangForm.is_active}
                      onChange={(e) =>
                        setNewLangForm({ ...newLangForm, is_active: e.target.checked })
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Langsung aktifkan bahasa ini di portal publik</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Menambahkan...' : 'Tambah Bahasa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Key Baru */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <form onSubmit={handleAddKeySubmit}>
              <div className="flex items-center justify-between p-4.5 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Tambah Key Teks Baru</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Nama Key (Gunakan dot notation)
                  </label>
                  <input
                    type="text"
                    value={newKeyForm.key_teks}
                    onChange={(e) =>
                      setNewKeyForm({ ...newKeyForm, key_teks: e.target.value.toLowerCase().trim() })
                    }
                    placeholder="Contoh: hero.deskripsi_baru"
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden font-mono"
                    required
                  />
                  <p className="text-[10px] text-zinc-400">
                    Gunakan awalan kategori seperti: nav.*, hero.*, kandidat.*, umum.*
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Teks Terjemahan ({currentLangObj.nama})
                  </label>
                  <textarea
                    rows={3}
                    value={newKeyForm.value_teks}
                    onChange={(e) =>
                      setNewKeyForm({ ...newKeyForm, value_teks: e.target.value })
                    }
                    placeholder="Masukkan teks terjemahan..."
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

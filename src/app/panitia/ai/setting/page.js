'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Save,
  ArrowLeft,
  HelpCircle,
  Settings2,
  X,
  Sliders,
  Globe2,
} from 'lucide-react';
import {
  getAiFaqList,
  saveAiFaq,
  deleteAiFaq,
  toggleAiFaq,
  getAiSetting,
  saveAiSetting,
} from '@/api/panitia/ai';

export default function PanitiaAiSettingPage() {
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' | 'config'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  // FAQ State
  const [faqList, setFaqList] = useState([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    kategori: 'Umum & Profil KPU',
    pertanyaan: '',
    jawaban: '',
    urutan: 1,
    is_active: true,
  });

  // Setting State
  const [setting, setSetting] = useState({
    system_prompt: '',
    bahasa_diizinkan: 'id,en',
    max_tokens: 500,
    temperature: 1.0,
    rate_limit_per_menit: 12,
  });

  const availableLanguages = [
    { kode: 'id', label: 'Bahasa Indonesia (ID)' },
    { kode: 'en', label: 'English (EN)' },
    { kode: 'ar', label: 'العربية (AR)' },
    { kode: 'fr', label: 'Français (FR)' },
    { kode: 'ru', label: 'Русский (RU)' },
    { kode: 'ja', label: '日本語 (JA)' },
    { kode: 'zh', label: '中文 (ZH)' },
  ];

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = async () => {
    setLoading(true);
    const [faqRes, setRes] = await Promise.all([
      getAiFaqList(),
      getAiSetting(),
    ]);

    if (faqRes.success) {
      setFaqList(faqRes.data || []);
    }
    if (setRes.success && setRes.data) {
      setSetting({
        system_prompt: setRes.data.system_prompt || '',
        bahasa_diizinkan: setRes.data.bahasa_diizinkan || 'id,en',
        max_tokens: setRes.data.max_tokens || 500,
        temperature: Number(setRes.data.temperature) || 1.0,
        rate_limit_per_menit: setRes.data.rate_limit_per_menit || 12,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler FAQ Modal Open
  const handleOpenFaqModal = (item = null) => {
    if (item) {
      setEditingFaq(item);
      setFaqForm({
        kategori: item.kategori || 'Umum & Profil KPU',
        pertanyaan: item.pertanyaan || '',
        jawaban: item.jawaban || '',
        urutan: item.urutan || 1,
        is_active: item.is_active !== undefined ? item.is_active : true,
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        kategori: 'Umum & Profil KPU',
        pertanyaan: '',
        jawaban: '',
        urutan: faqList.length + 1,
        is_active: true,
      });
    }
    setIsFaqModalOpen(true);
  };

  // Submit FAQ
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.pertanyaan.trim() || !faqForm.jawaban.trim()) {
      showNotification('error', 'Pertanyaan dan jawaban wajib diisi.');
      return;
    }

    setSaving(true);
    const payload = {
      ...faqForm,
      id: editingFaq?.id,
    };

    const res = await saveAiFaq(payload);
    setSaving(false);

    if (res.success) {
      showNotification('success', editingFaq ? 'FAQ berhasil diperbarui.' : 'FAQ baru berhasil ditambahkan.');
      setIsFaqModalOpen(false);
      loadData();
    } else {
      showNotification('error', res.error || 'Gagal menyimpan FAQ.');
    }
  };

  // Toggle FAQ Active
  const handleToggleFaq = async (id, currentStatus) => {
    const res = await toggleAiFaq(id, !currentStatus);
    if (res.success) {
      setFaqList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_active: !currentStatus } : f))
      );
    } else {
      showNotification('error', res.error || 'Gagal mengubah status FAQ.');
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (id, title) => {
    if (!confirm(`Hapus FAQ: "${title}"?`)) return;

    const res = await deleteAiFaq(id);
    if (res.success) {
      showNotification('success', 'FAQ berhasil dihapus.');
      setFaqList((prev) => prev.filter((f) => f.id !== id));
    } else {
      showNotification('error', res.error || 'Gagal menghapus FAQ.');
    }
  };

  // Handle Setting Save
  const handleSaveSetting = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveAiSetting(setting);
    setSaving(false);

    if (res.success) {
      showNotification('success', 'Konfigurasi AI berhasil disimpan dan diperbarui.');
    } else {
      showNotification('error', res.error || 'Gagal menyimpan konfigurasi.');
    }
  };

  // Toggle Language Checkbox
  const handleToggleLanguage = (kode) => {
    const currentList = setting.bahasa_diizinkan
      ? setting.bahasa_diizinkan.split(',').map((k) => k.trim())
      : ['id'];

    let updated;
    if (currentList.includes(kode)) {
      if (kode === 'id') {
        showNotification('error', 'Bahasa Indonesia (ID) wajib aktif sebagai bahasa utama.');
        return;
      }
      updated = currentList.filter((k) => k !== kode);
    } else {
      updated = [...currentList, kode];
    }

    setSetting((prev) => ({
      ...prev,
      bahasa_diizinkan: updated.join(','),
    }));
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
          <Link
            href="/panitia/ai"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
            title="Kembali ke Dashboard AI"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Pengaturan AI & Basis Pengetahuan
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kelola FAQ pertanyaan umum, parameter OpenAI, dan panduan netralitas Sams Asisten.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Basis FAQ ({faqList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Konfigurasi & Prompt</span>
          </button>
        </div>
      </div>

      {/* Content Tab 1: Basis FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Pertanyaan Umum (FAQ)
              </h2>
              <p className="text-xs text-zinc-500">
                FAQ ini menjadi rujukan otomatis bagi AI untuk menjawab pertanyaan mahasiswa secara cepat dan akurat.
              </p>
            </div>
            <button
              onClick={() => handleOpenFaqModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah FAQ</span>
            </button>
          </div>

          <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-16 text-center">Urutan</th>
                    <th className="py-3 px-4 font-semibold w-44">Kategori</th>
                    <th className="py-3 px-4 font-semibold">Pertanyaan</th>
                    <th className="py-3 px-4 font-semibold">Ringkasan Jawaban</th>
                    <th className="py-3 px-4 font-semibold w-24 text-center">Status</th>
                    <th className="py-3 px-4 font-semibold w-24 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-400">
                        Memuat basis data FAQ...
                      </td>
                    </tr>
                  ) : faqList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-400">
                        Belum ada FAQ tersimpan. Klik tombol Tambah FAQ untuk membuat.
                      </td>
                    </tr>
                  ) : (
                    faqList.map((faq) => (
                      <tr
                        key={faq.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition"
                      >
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-500">
                          {faq.urutan}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]">
                            {faq.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {faq.pertanyaan}
                        </td>
                        <td className="py-3 px-4 max-w-sm truncate text-zinc-500">
                          {faq.jawaban}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFaq(faq.id, faq.is_active)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                              faq.is_active ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                faq.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenFaqModal(faq)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id, faq.pertanyaan)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Hapus FAQ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab 2: Konfigurasi Model & Prompt */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveSetting} className="space-y-6">
          {/* Section 1: System Prompt */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>System Prompt & Karakter Asisten</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Instruksi panduan cara berbicara, persona, dan etika netralitas yang wajib dipatuhi model AI.
                </p>
              </div>
            </div>

            <textarea
              rows={6}
              value={setting.system_prompt}
              onChange={(e) => setSetting({ ...setting, system_prompt: e.target.value })}
              placeholder="Masukkan instruksi instruktif system prompt..."
              className="w-full p-4 rounded-2xl text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-hidden font-mono"
            />
          </div>

          {/* Section 2: Parameter Teknis OpenAI */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Parameter Model OpenAI
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <label htmlFor="maxTokens">Max Completion Tokens</label>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {setting.max_tokens}
                  </span>
                </div>
                <input
                  id="maxTokens"
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={setting.max_tokens}
                  onChange={(e) =>
                    setSetting({ ...setting, max_tokens: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400">
                  Membatasi panjang balasan asisten per percakapan demi menghemat kuota token.
                </p>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <label htmlFor="temperature">Temperature</label>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {setting.temperature}
                  </span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.1"
                  value={setting.temperature}
                  onChange={(e) =>
                    setSetting({ ...setting, temperature: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400">
                  0.0 = Sangat faktual & kaku, 1.0 = Seimbang ramah, 1.5 = Kreatif.
                </p>
              </div>

              {/* Rate Limit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <label htmlFor="rateLimit">Rate Limit (Pesan / Menit)</label>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {setting.rate_limit_per_menit} / mnt
                  </span>
                </div>
                <input
                  id="rateLimit"
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={setting.rate_limit_per_menit}
                  onChange={(e) =>
                    setSetting({ ...setting, rate_limit_per_menit: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400">
                  Maksimal pertanyaan dari satu IP per menit untuk mencegah spam/DDoS.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Bahasa yang Diizinkan */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Bahasa yang Diizinkan untuk Layanan AI
                </h2>
                <p className="text-xs text-zinc-500">
                  Pilih bahasa mana saja yang boleh dijawab oleh Sams Asisten.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {availableLanguages.map((lang) => {
                const isChecked = setting.bahasa_diizinkan
                  ?.split(',')
                  .map((k) => k.trim())
                  .includes(lang.kode);

                return (
                  <label
                    key={lang.kode}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-xs font-semibold ${
                      isChecked
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300'
                        : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleLanguage(lang.kode)}
                      className="rounded accent-blue-600 cursor-pointer"
                    />
                    <span>{lang.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 transition shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan AI'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal Tambah / Edit FAQ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <form onSubmit={handleSaveFaq}>
              <div className="flex items-center justify-between p-4.5 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {editingFaq ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Kategori & Urutan */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={faqForm.kategori}
                      onChange={(e) => setFaqForm({ ...faqForm, kategori: e.target.value })}
                      placeholder="Contoh: Syarat Pemilih"
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Urutan Tampil
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={faqForm.urutan}
                      onChange={(e) => setFaqForm({ ...faqForm, urutan: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                {/* Pertanyaan */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Pertanyaan Pengguna
                  </label>
                  <input
                    type="text"
                    value={faqForm.pertanyaan}
                    onChange={(e) => setFaqForm({ ...faqForm, pertanyaan: e.target.value })}
                    placeholder="Contoh: Apa syarat menjadi calon presiden mahasiswa?"
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Jawaban */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Jawaban Resmi KPU
                  </label>
                  <textarea
                    rows={4}
                    value={faqForm.jawaban}
                    onChange={(e) => setFaqForm({ ...faqForm, jawaban: e.target.value })}
                    placeholder="Tuliskan jawaban yang detail, jelas, dan akurat..."
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-hidden"
                    required
                  />
                </div>

                {/* Status Aktif */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="faqActive"
                    checked={faqForm.is_active}
                    onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                    className="rounded accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="faqActive" className="text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium">
                    Aktifkan FAQ ini dalam basis pengetahuan Sams Asisten
                  </label>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

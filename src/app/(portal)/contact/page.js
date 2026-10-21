'use client';

import { useState } from 'react';
import { kirimPesanKontak } from '@/api/publlic/contact';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';

export default function ContactPortalPage() {
  const { t } = useTranslation();
  const [nama, setNama] = useState('');
  const [jenisKontak, setJenisKontak] = useState('whatsapp');
  const [emailOrNoTelp, setEmailOrNoTelp] = useState('');
  const [pesan, setPesan] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: null, message: '' });

  const handleToggleKontak = () => {
    setJenisKontak((prev) => (prev === 'whatsapp' ? 'email' : 'whatsapp'));
    setEmailOrNoTelp('');
    setStatus({ success: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrNoTelp || !pesan) {
      setStatus({ success: false, message: t('pg.kontak_err_required', 'Kontak dan pesan wajib diisi.') });
      return;
    }

    setLoading(true);
    setStatus({ success: null, message: '' });

    try {
      const res = await kirimPesanKontak({
        nama,
        emailOrNoTelp,
        jenisKontak,
        pesan,
      });

      if (res.success) {
        setStatus({
          success: true,
          message: res.message || t('pg.kontak_ok', 'Pesan Anda berhasil dikirim ke Panitia KPU.'),
        });
        setNama('');
        setEmailOrNoTelp('');
        setPesan('');
      } else {
        setStatus({
          success: false,
          message: res.error || t('pg.kontak_err_fail', 'Gagal mengirim pesan. Silakan coba lagi.'),
        });
      }
    } catch (err) {
      setStatus({
        success: false,
        message: t('pg.kontak_err_system', 'Terjadi kesalahan sistem saat mengirim pesan.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start my-auto">
        {/* Info Kontak & Sekretariat */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>{t('pg.kontak_channel', 'Kanal Informasi & Pengaduan')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-blue-950 dark:text-zinc-100 tracking-tight">
            {t('kontak.title', 'Hubungi Panitia KPU Mahasiswa')}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('kontak.subtitle', 'Punya pertanyaan mengenai syarat pemilih, tahapan pemilihan, atau ingin menyampaikan aduan terkait pelaksanaan pemilu? Kirimkan pesan Anda melalui formulir resmi ini.')}
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 flex items-start gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-950 dark:text-zinc-100">{t('pg.kontak_sekre_title', 'Sekretariat KPU')}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t('pg.kontak_sekre_desc', 'Gedung Kampus Politeknik LP3I, Ruang Komisi Pemilihan Umum Mahasiswa.')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 flex items-start gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-950 dark:text-zinc-100">{t('pg.kontak_hours_title', 'Jam Layanan Panitia')}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {t('pg.kontak_hours_weekday', 'Senin – Jumat: 08.30 – 17.00 WIB')}
                  <br />
                  {t('pg.kontak_hours_sat', 'Sabtu: 09.00 – 14.00 WIB')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulir Kontak Konvensional dengan Switch WhatsApp / Email */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 shadow-xs relative">
            <h2 className="text-lg sm:text-xl font-bold text-blue-950 dark:text-zinc-100 mb-2">
              {t('pg.kontak_form_title', 'Kirim Pesan / Pengaduan')}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
              {t('pg.kontak_form_desc', 'Data yang Anda kirimkan akan diterima langsung oleh pengurus panitia KPU Mahasiswa.')}
            </p>

            {/* Alert Status */}
            {status.message && (
              <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs leading-relaxed border ${
                status.success
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                  : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}>
                {status.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-700 dark:text-blue-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Pengirim */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('pg.kontak_name_label', 'Nama Lengkap (Opsional / Mahasiswa)')}
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder={t('pg.kontak_name_ph', 'Contoh: Muhammad Fajar')}
                  className="w-full px-4 py-2.5 rounded-xl bg-blue-50/40 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>

              {/* Inputan Kontak dengan Switch Button WhatsApp ⇄ Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {jenisKontak === 'whatsapp' ? t('pg.kontak_label_wa', 'Nomor WhatsApp *') : t('pg.kontak_label_email', 'Alamat Email *')}
                  </label>

                  {/* Tombol Switch Berpindah WhatsApp ⇄ Email */}
                  <button
                    type="button"
                    onClick={handleToggleKontak}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 dark:text-blue-300 transition px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                    <span>
                      {jenisKontak === 'whatsapp' ? t('pg.kontak_switch_email', 'Ubah ke Email') : t('pg.kontak_switch_wa', 'Ubah ke WhatsApp')}
                    </span>
                  </button>
                </div>

                <div className="relative">
                  {jenisKontak === 'whatsapp' ? (
                    <input
                      type="number"
                      required
                      value={emailOrNoTelp}
                      onChange={(e) => setEmailOrNoTelp(e.target.value)}
                      placeholder={t('pg.kontak_ph_wa', 'Contoh: 081234567890')}
                      className="w-full px-4 py-2.5 rounded-xl bg-blue-50/40 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    />
                  ) : (
                    <input
                      type="email"
                      required
                      value={emailOrNoTelp}
                      onChange={(e) => setEmailOrNoTelp(e.target.value)}
                      placeholder={t('pg.kontak_ph_email', 'Contoh: fajar@mahasiswa.lp3i.ac.id')}
                      className="w-full px-4 py-2.5 rounded-xl bg-blue-50/40 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                    />
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {jenisKontak === 'whatsapp'
                    ? t('pg.kontak_hint_wa', 'Default nomor WhatsApp aktif untuk respon balasan cepat dari panitia.')
                    : t('pg.kontak_hint_email', 'Alamat email aktif Anda.')}
                </p>
              </div>

              {/* Pesan Kontak */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('pg.kontak_msg_label', 'Isi Pesan / Pertanyaan / Aduan *')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder={t('pg.kontak_msg_ph', 'Tuliskan pesan atau pertanyaan Anda di sini...')}
                  className="w-full px-4 py-2.5 rounded-xl bg-blue-50/40 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                />
              </div>

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white disabled:opacity-50 text-xs font-bold shadow-sm shadow-blue-900/15 transition active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <span>{t('pg.kontak_sending', 'Mengirim pesan...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('pg.kontak_send', 'Kirim Pesan ke Panitia')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

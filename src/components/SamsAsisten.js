'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, RefreshCw, HelpCircle, ChevronDown, Move, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatDenganSamsAsisten } from '@/api/openai/route';
import { getPublicAiFaq } from '@/api/publlic/ai';
import { KPU_FAQ_DATA } from '@/data/faqDataAi';
import { TIMING_CONFIG } from '@/lib/timingConfig';
import { useTranslation } from '@/hooks/useTranslation';

export default function SamsAsisten() {
  const { t, lang } = useTranslation();

  const getInitialMessage = useCallback(
    () => ({
      role: 'assistant',
      content: t(
        'sams.initial_message',
        'Halo! Saya **Sams Asisten**, asisten cerdas resmi dari Komisi Pemilihan Umum (KPU) Mahasiswa Politeknik LP3I. Ada yang bisa saya bantu seputar tata cara, syarat pemilih, syarat calon, atau jadwal Pemilu Raya BEM?'
      ),
    }),
    [t]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [getInitialMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState(KPU_FAQ_DATA);
  const [showFaqList, setShowFaqList] = useState(false);
  const chatBottomRef = useRef(null);
  const sessionIdRef = useRef('');

  // Sinkronkan pesan pembuka jika user mengganti bahasa
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [getInitialMessage, lang]);

  // State Notifikasi Bubble (hanya tampil pertama kali dan persist per session)
  const [showNotif, setShowNotif] = useState(false);

  // State Draggable Position & Drag Mode
  const [isDragMode, setIsDragMode] = useState(false);
  const [position, setPosition] = useState(null); // { x: number, y: number }
  const containerRef = useRef(null);

  // Refs untuk tracking pointer & timer
  const pointerDownPosRef = useRef({ x: 0, y: 0, time: 0 });
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const clickTimerRef = useRef(null);
  const holdTimerRef = useRef(null);

  // Inisialisasi notifikasi & session ID
  useEffect(() => {
    try {
      let currentSession = sessionStorage.getItem('sams_session_id');
      if (!currentSession) {
        currentSession = 'sams_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('sams_session_id', currentSession);
      }
      sessionIdRef.current = currentSession;

      const dismissed = sessionStorage.getItem('sams_notif_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowNotif(true);
        }, TIMING_CONFIG.SAMS_NOTIF_DELAY);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Ambil basis data FAQ publik sesuai bahasa yang aktif (dengan caching sessionStorage)
  useEffect(() => {
    let cancelled = false;
    const cacheKey = `kpu_faq_lang_${lang}`;

    if (lang !== 'id') {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFaqData(parsed);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    getPublicAiFaq(lang).then((res) => {
      if (cancelled) return;
      if (res.success && res.data && res.data.length > 0) {
        setFaqData(res.data);
        if (lang !== 'id') {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
          } catch (e) {
            // ignore
          }
        }
      }
    }).catch((err) => {
      console.error('[SamsAsisten:FAQ error]:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const handleDismissNotif = (e) => {
    e?.stopPropagation();
    setShowNotif(false);
    try {
      sessionStorage.setItem('sams_notif_dismissed', 'true');
    } catch (e) {
      // ignore
    }
  };

  // Scroll chat ke bawah saat pesan bertambah
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Update posisi di dalam batas viewport layar
  const updatePosition = useCallback((clientX, clientY) => {
    const newX = Math.max(16, Math.min(window.innerWidth - 76, clientX - dragOffsetRef.current.x));
    const newY = Math.max(16, Math.min(window.innerHeight - 80, clientY - dragOffsetRef.current.y));
    setPosition({ x: newX, y: newY });
  }, []);

  // Handler Pointer Down pada tombol Move khusus (Bisa langsung drag seketika!)
  const handleMoveButtonPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragMode(true);

    const rect = containerRef.current?.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - (rect ? rect.left : 0),
      y: e.clientY - (rect ? rect.top : 0),
    };

    const onPointerMove = (ev) => {
      updatePosition(ev.clientX, ev.clientY);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Handler Pointer Down pada Icon Bot (Mendukung Double Click, Tahan / Long Press, dan Drag)
  const handleBotPointerDown = (e) => {
    if (isOpen) return;

    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isDraggingRef.current = false;

    const rect = containerRef.current?.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - (rect ? rect.left : 0),
      y: e.clientY - (rect ? rect.top : 0),
    };

    // Tahan (Long Press) 350ms langsung aktifkan mode geser
    holdTimerRef.current = setTimeout(() => {
      setIsDragMode(true);
      isDraggingRef.current = true;
      if (navigator.vibrate) navigator.vibrate(40);
    }, 350);

    const onPointerMove = (ev) => {
      const dx = Math.abs(ev.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(ev.clientY - pointerDownPosRef.current.y);

      // Jika bergerak sebelum 350ms, batalkan long press
      if (dx > 5 || dy > 5) {
        if (!isDragMode && !isDraggingRef.current) {
          clearTimeout(holdTimerRef.current);
        }
      }

      if (isDragMode || isDraggingRef.current) {
        isDraggingRef.current = true;
        updatePosition(ev.clientX, ev.clientY);
      }
    };

    const onPointerUp = (ev) => {
      clearTimeout(holdTimerRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const dist = Math.hypot(
        ev.clientX - pointerDownPosRef.current.x,
        ev.clientY - pointerDownPosRef.current.y
      );

      // Jika telah digeser (> 8px) atau sedang dragging, jangan buka chat
      if (dist > 8 || isDraggingRef.current) {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 60);
        return;
      }

      // Jika dalam mode drag, klik biasa mengunci kembali posisi
      if (isDragMode) {
        setIsDragMode(false);
        return;
      }

      // Deteksi Double Click (klik 2x untuk toggle mode geser)
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        setIsDragMode(true);
        if (navigator.vibrate) navigator.vibrate(40);
      } else {
        // Single Click: tunggu 220ms untuk memastikan bukan double-click
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null;
          setIsOpen(true);
        }, 220);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleSend = async (textToSend = null) => {
    const content = (textToSend || input).trim();
    if (!content || loading) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setShowFaqList(false);
    setLoading(true);

    try {
      const res = await chatDenganSamsAsisten(newMessages, sessionIdRef.current);
      if (res.success && res.reply) {
        setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: res.error || t('sams.err_server', 'Maaf, terjadi gangguan saat menghubungi server AI. Silakan coba kembali nanti.'),
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t('sams.err_busy', 'Maaf, jaringan sedang sibuk. Silakan coba beberapa saat lagi.'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([getInitialMessage()]);
    setShowFaqList(false);
  };

  // Inline style untuk floating position (hanya dipakai saat chatbox tertutup)
  const containerStyle = !isOpen && position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`${
        isOpen || !position ? 'fixed bottom-18 md:bottom-6 right-4 sm:right-6' : ''
      } z-50 select-none`}
    >
      {/* Floating Toggle Button (Icon Only + Floating + Draggable) */}
      {!isOpen && (
        <div className="relative flex items-center">
          {/* Div Notifikasi Bubble (Menempel di samping icon) */}
          {showNotif && (
            <div className="absolute right-15 bottom-0 flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-blue-200/90 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xl whitespace-nowrap animate-in fade-in zoom-in-90 slide-in-from-right-3 duration-400 ease-out">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight text-blue-950 dark:text-zinc-100">
                  {t('sams.notif_title', 'Tanya Sams Asisten')}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {t('sams.notif_sub', 'AI Pemilu Raya LP3I')}
                </span>
              </div>

              {/* Tombol X untuk menutup notifikasi permanen di sesi ini */}
              <button
                type="button"
                onClick={handleDismissNotif}
                title={t('sams.notif_close', 'Tutup Notifikasi')}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer ml-1"
                aria-label={t('sams.notif_close', 'Tutup Notifikasi')}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Segitiga speech bubble pointer yang mengarah ke icon */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/95 dark:bg-zinc-900/95 border-t border-r border-blue-200/90 dark:border-zinc-800 rotate-45 pointer-events-none" />
            </div>
          )}

          {/* Tombol Pindah Posisi (SELALU MUNCUL agar user mudah memindahkan posisi) */}
          <button
            type="button"
            onPointerDown={handleMoveButtonPointerDown}
            onClick={(e) => {
              e.stopPropagation();
              setIsDragMode((prev) => !prev);
            }}
            title={
              isDragMode
                ? t('sams.btn_drag_lock', 'Klik untuk mengunci posisi')
                : t('sams.btn_drag_move', 'Geser tombol ini untuk memindahkan Sams Asisten, atau klik untuk mengaktifkan mode geser')
            }
            className={`absolute -top-2.5 -left-2.5 z-30 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all touch-none cursor-grab active:cursor-grabbing ${
              isDragMode
                ? 'bg-blue-600 text-white ring-2 ring-white dark:ring-zinc-950 scale-110'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:scale-110 active:scale-95'
            }`}
            aria-label={t('sams.btn_drag_move', 'Pindahkan posisi Sams Asisten')}
          >
            {isDragMode ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Move className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Tombol Icon Sams Asisten Bulat Saja dengan Animasi Float Naik-Turun Kanan-Kiri */}
          <div
            onPointerDown={handleBotPointerDown}
            title={
              isDragMode
                ? t('sams.bot_drag_mode', 'Mode geser aktif. Geser untuk memindahkan, klik tombol centang untuk mengunci.')
                : t('sams.bot_click_mode', 'Klik untuk membuka chat. Klik 2x atau tahan untuk menggeser posisi.')
            }
            className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 select-none ${
              isDragMode
                ? 'cursor-grab active:cursor-grabbing ring-4 ring-blue-500/80 scale-105 shadow-2xl bg-blue-700 text-white touch-none'
                : 'cursor-pointer hover:scale-105 active:scale-95 shadow-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-700/80 dark:border-zinc-300 animate-sams-float'
            }`}
            aria-label={t('sams.header_title', 'Sams Asisten KPU')}
          >
            <Bot className="w-6 h-6" />

            {/* Badge status / mode indicator */}
            {isDragMode ? (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 shadow-xs">
                <Move className="w-2.5 h-2.5" />
              </span>
            ) : (
              <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[390px] h-[530px] max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Dialog */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>{t('sams.header_title', 'Sams Asisten KPU')}</span>
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  {t('sams.header_status', 'Online • Pemilu Raya BEM LP3I')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title={t('sams.reset_title', 'Reset Percakapan')}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={t('sams.close_title', 'Tutup Chat')}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${msg.role === 'user'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-none shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-none'
                    }`}
                >
                  <div className="prose dark:prose-invert prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs py-1">
                <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>{t('sams.loading', 'Sams Asisten sedang merumuskan jawaban...')}</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick FAQ Dropdown / Chips */}
          <div className="px-3 py-2 bg-zinc-50 dark:bg-black/60 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-zinc-500" />
                {t('sams.faq_title', 'Pertanyaan Populer Pemilu')}
              </span>
              <button
                type="button"
                onClick={() => setShowFaqList(!showFaqList)}
                className="text-[10px] text-zinc-700 dark:text-zinc-300 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                {showFaqList ? t('sams.faq_close', 'Tutup Daftar') : t('sams.faq_see_all', 'Lihat Semua')}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFaqList ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFaqList ? (
              <div className="max-h-28 overflow-y-auto space-y-1 py-1">
                {faqData.map((faq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(faq.pertanyaan)}
                    disabled={loading}
                    className="w-full text-left text-[11px] py-1 px-2 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition line-clamp-1 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                  >
                    • {faq.pertanyaan}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {faqData.slice(0, 3).map((faq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(faq.pertanyaan)}
                    disabled={loading}
                    className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                  >
                    {faq.pertanyaan}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Input Pesan */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('sams.input_ph', 'Tanyakan seputar Pemilu KPU...')}
              disabled={loading}
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-zinc-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 rounded-xl transition cursor-pointer"
              aria-label={t('sams.send_aria', 'Kirim Pesan')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
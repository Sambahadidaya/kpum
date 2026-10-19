'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Crop as CropIcon,
} from 'lucide-react';


/**
 * ImageCropperModal
 * Modal interaktif untuk verifikasi dan pemotongan (crop) gambar foto panitia maupun gambar background kartu.
 * Mendukung drag untuk menggeser, zoom slider, rotasi 90 derajat, transparansi PNG utuh,
 * dan rasio aspek yang terkunci sesuai kebutuhan card panitia.
 */
export default function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName = 'image.png',
  isPng = false,
  aspectRatio = 4 / 5, // Default 4:5 untuk foto diri portrait, atau 16:9 untuk background
  title = 'Verifikasi & Crop Gambar',
  subtitle = 'Atur posisi dan perbesaran gambar agar pas dengan rasio tampilan kartu.',
  onConfirm,
  onClose,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.5);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ukuran viewport canvas internal
  const VIEW_WIDTH = 520;
  const VIEW_HEIGHT = 420;

  // Hitung ukuran kotak crop di tengah canvas
  const getCropRect = useCallback(() => {
    const padding = 32;
    const maxW = VIEW_WIDTH - padding * 2;
    const maxH = VIEW_HEIGHT - padding * 2;

    let width = maxW;
    let height = width / aspectRatio;

    if (height > maxH) {
      height = maxH;
      width = height * aspectRatio;
    }

    const x = (VIEW_WIDTH - width) / 2;
    const y = (VIEW_HEIGHT - height) / 2;

    return { x, y, width, height };
  }, [aspectRatio]);

  // Load gambar sumber
  useEffect(() => {
    if (!imageSrc || !isOpen) {
      setImgLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;

      // Hitung skala default agar gambar menutupi kotak crop
      const crop = getCropRect();
      const scaleX = crop.width / img.width;
      const scaleY = crop.height / img.height;
      const fitScale = Math.max(scaleX, scaleY);

      setMinScale(Math.max(0.2, fitScale * 0.8));
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen, getCropRect]);

  // Gambar ke canvas setiap ada perubahan transformasi
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    const crop = getCropRect();

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    // Jika file adalah PNG, gambar pattern checkerboard halus di area crop sebagai indikator transparansi
    if (isPng) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(crop.x, crop.y, crop.width, crop.height);
      ctx.clip();

      const sq = 12;
      for (let i = crop.x; i < crop.x + crop.width; i += sq) {
        for (let j = crop.y; j < crop.y + crop.height; j += sq) {
          ctx.fillStyle =
            (Math.floor(i / sq) + Math.floor(j / sq)) % 2 === 0
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.02)';
          ctx.fillRect(i, j, sq, sq);
        }
      }
      ctx.restore();
    }

    // Gambar gambar dengan transformasi
    ctx.save();
    // Titik pusat crop
    const cropCenterX = crop.x + crop.width / 2;
    const cropCenterY = crop.y + crop.height / 2;

    ctx.translate(cropCenterX + offset.x, cropCenterY + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Gambar posisi tengah
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Gambar mask gelap di luar kotak crop
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';

    // Atas
    ctx.fillRect(0, 0, VIEW_WIDTH, crop.y);
    // Bawah
    ctx.fillRect(0, crop.y + crop.height, VIEW_WIDTH, VIEW_HEIGHT - (crop.y + crop.height));
    // Kiri
    ctx.fillRect(0, crop.y, crop.x, crop.height);
    // Kanan
    ctx.fillRect(crop.x + crop.width, crop.y, VIEW_WIDTH - (crop.x + crop.width), crop.height);

    // Border kotak crop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Garis bantu Rule of Thirds
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertikal
    ctx.moveTo(crop.x + crop.width / 3, crop.y);
    ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
    ctx.moveTo(crop.x + (crop.width * 2) / 3, crop.y);
    ctx.lineTo(crop.x + (crop.width * 2) / 3, crop.y + crop.height);
    // Horizontal
    ctx.moveTo(crop.x, crop.y + crop.height / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
    ctx.moveTo(crop.x, crop.y + (crop.height * 2) / 3);
    ctx.lineTo(crop.x + crop.width, crop.y + (crop.height * 2) / 3);
    ctx.stroke();

    ctx.restore();
  }, [imgLoaded, scale, offset, rotation, isPng, getCropRect]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Interaksi Drag dengan Mouse & Touch
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom dengan Wheel Mouse
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale((prev) => Math.min(3.5, Math.max(minScale * 0.5, prev + delta)));
  };

  // Rotasi 90 derajat
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset Posisi
  const handleReset = () => {
    const img = imgRef.current;
    if (!img) return;
    const crop = getCropRect();
    const fitScale = Math.max(crop.width / img.width, crop.height / img.height);
    setScale(fitScale);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  // Proses Crop & Ekspor File
  const handleCropConfirm = async () => {
    const img = imgRef.current;
    if (!img) return;

    setIsProcessing(true);
    try {
      const crop = getCropRect();

      // Tentukan resolusi output tinggi berdasarkan tipe (portrait foto vs landscape bg)
      let outWidth = 960;
      let outHeight = Math.round(outWidth / aspectRatio);

      if (aspectRatio > 1) {
        // Landscape (misal 16:9 bg)
        outWidth = 1440;
        outHeight = Math.round(outWidth / aspectRatio);
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = outWidth;
      outCanvas.height = outHeight;
      const outCtx = outCanvas.getContext('2d');

      // Terapkan rasio skala antara tampilan di canvas UI dengan resolusi output sebenarnya
      const exportRatio = outWidth / crop.width;

      outCtx.translate(outWidth / 2, outHeight / 2);
      outCtx.translate(offset.x * exportRatio, offset.y * exportRatio);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.scale(scale * exportRatio, scale * exportRatio);

      // Gambar gambar dengan resolusi penuh
      outCtx.drawImage(img, -img.width / 2, -img.height / 2);

      // Tentukan format ekspor: jika PNG pertahankan PNG murni dengan alpha channel
      const mimeType = isPng ? 'image/png' : 'image/webp';
      const outputName = isPng
        ? (fileName || 'foto-panitia').replace(/\.[^/.]+$/, '') + '.png'
        : (fileName || 'gambar-panitia').replace(/\.[^/.]+$/, '') + '.webp';

      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            alert('Gagal memproses hasil pemotongan gambar.');
            return;
          }

          const file = new File([blob], outputName, { type: mimeType });
          setIsProcessing(false);
          onConfirm(file);
        },
        mimeType,
        isPng ? 0.95 : 0.88
      );
    } catch (err) {
      setIsProcessing(false);
      alert('Terjadi kesalahan saat memotong gambar: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 my-6 shadow-2xl transition-all">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-zinc-900 border border-blue-200/80 dark:border-zinc-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CropIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
              {isPng && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  PNG Transparan
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Canvas Crop */}
        <div className="relative w-full aspect-5/4 sm:aspect-13/9 bg-zinc-900 dark:bg-black rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-800 flex items-center justify-center select-none shadow-inner">
          <canvas
            ref={canvasRef}
            width={VIEW_WIDTH}
            height={VIEW_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing touch-none"
          />

          {!imgLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Memuat pratinjau gambar...</span>
            </div>
          )}

          {/* Indikator Rasio di sudut viewport */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10 shadow-xs">
              {aspectRatio === 4 / 5 ? 'Rasio Foto 4:5 (Portrait)' : 'Rasio Background 16:9'}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] text-zinc-400 border border-white/10 shadow-xs">
              Geser untuk memindahkan • Scroll/Slider untuk zoom
            </span>
          </div>
        </div>

        {/* Kontrol Transformasi: Zoom, Rotasi, Reset */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2.5 w-full sm:w-72">
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(minScale * 0.5, prev - 0.1))}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={minScale * 0.5}
                max={Math.max(3, minScale * 3.5)}
                step="0.02"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(3.5, prev + 0.1))}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Aksi Tambahan: Rotasi & Reset */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRotate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
                title="Putar 90 Derajat"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar ({rotation}°)</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
                title="Reset Posisi & Zoom"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold cursor-pointer transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCropConfirm}
            disabled={isProcessing || !imgLoaded}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Crop...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan & Unggah</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

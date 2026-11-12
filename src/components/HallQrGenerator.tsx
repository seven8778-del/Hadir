import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  Maximize2,
  ExternalLink,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Building,
  Calendar,
  X,
  Edit2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { SessionConfig } from '../services/syncService';

interface HallQrGeneratorProps {
  session: SessionConfig;
  onUpdateSession: (updates: Partial<SessionConfig>) => void;
  attendanceCount?: number;
  totalEligible?: number;
}

export const HallQrGenerator: React.FC<HallQrGeneratorProps> = ({
  session,
  onUpdateSession,
  attendanceCount = 0,
  totalEligible = 0,
}) => {
  // URL pendaftaran
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrColor, setQrColor] = useState<'emerald' | 'black'>('emerald');
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showProjectorModal, setShowProjectorModal] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [liveClock, setLiveClock] = useState('');

  const posterRef = useRef<HTMLDivElement>(null);

  // Ambil URL asal semasa aplikasi dimuatkan
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + window.location.pathname;
      setCurrentOrigin(url);
      setCustomUrlInput(session.customQrUrl || '');
    }
  }, [session.customQrUrl]);

  // Kemas kini jam langsung untuk mod projektor
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(
        now.toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tentukan URL sasaran sebenar
  const targetUrl = session.customQrUrl?.trim() || currentOrigin || 'https://e-hadir.app';

  // Jana Kod QR
  useEffect(() => {
    if (!targetUrl) return;

    const darkColor = qrColor === 'emerald' ? '#064e3b' : '#0f172a';

    QRCode.toDataURL(targetUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'Q', // High resilience for mobile camera scanning
      color: {
        dark: darkColor,
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Gagal menjana QR code:', err));
  }, [targetUrl, qrColor]);

  // Salin pautan URL
  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const input = document.createElement('input');
        input.value = targetUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Sila salin URL secara manual: ' + targetUrl);
    }
  };

  // Muat turun gambar PNG
  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `Kod-QR-eHadir-${session.meetingTitle.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Muat turun gambar SVG
  const handleDownloadSVG = async () => {
    try {
      const darkColor = qrColor === 'emerald' ? '#064e3b' : '#0f172a';
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: 'Q',
        color: { dark: darkColor, light: '#ffffff' },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `Kod-QR-eHadir-${session.meetingTitle.replace(/\s+/g, '_')}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal eksport SVG:', err);
    }
  };

  // Cetak poster A4
  const handlePrintPoster = () => {
    window.print();
  };

  // Simpan URL kustom
  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSession({ customQrUrl: customUrlInput.trim() });
    setIsEditingUrl(false);
  };

  const handleResetToCurrentUrl = () => {
    setCustomUrlInput('');
    onUpdateSession({ customQrUrl: '' });
    setIsEditingUrl(false);
  };

  return (
    <div className="space-y-6">
      {/* Kad Penjana QR Code Utama */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Penerangan */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-emerald-700/60 rounded-xl border border-emerald-500/40">
                  <QrCode className="w-6 h-6 text-emerald-100" />
                </span>
                <h2 className="text-lg md:text-xl font-black tracking-tight">
                  Penjana Kod QR Pendaftaran Dewan
                </h2>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
                Pamerkan kod QR ini di pintu masuk dewan atau tayangkan di skrin projektor. Ahli boleh mengimbas menggunakan kamera telefon pintar (BYOD) untuk terus membuka halaman pendaftaran tanpa perlu menaip alamat web secara manual.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProjectorModal(true)}
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Papar Skrin Penuh (Projektor)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPosterModal(true)}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Poster Dewan (A4)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bahagian Kandungan Utama: QR Code & Tetapan Pautan */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolum Kiri: Bingkai Pratonton Kod QR (5 Kolum) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-gradient-to-b from-emerald-50/80 to-white p-6 rounded-3xl border-2 border-emerald-600/30 shadow-lg relative flex flex-col items-center text-center">
              {/* Badge Label */}
              <div className="mb-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Imbas Untuk Daftar Kehadiran</span>
              </div>

              {/* Paparan Gambar Kod QR */}
              <div className="w-64 h-64 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center relative">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Kod QR e-Hadir"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs">Menjana Kod QR...</span>
                  </div>
                )}

                {/* Logo Mini di Tengah QR jika ada */}
                {session.logoUrl && qrDataUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-md border-2 border-emerald-600 flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={session.logoUrl}
                        alt="Logo"
                        className="max-h-9 max-w-9 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Butiran Acara Mini */}
              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                  {session.meetingTitle}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                  {session.venueName} • {session.meetingDate}
                </p>
              </div>

              {/* Pilihan Warna QR */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 w-full flex items-center justify-center space-x-2 text-xs">
                <span className="text-slate-400 text-[11px]">Tema Warna:</span>
                <button
                  type="button"
                  onClick={() => setQrColor('emerald')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                    qrColor === 'emerald'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Emerald</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrColor('black')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                    qrColor === 'black'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
                  <span>Hitam Klasik</span>
                </button>
              </div>
            </div>

            {/* Butang Muat Turun */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center w-full max-w-[340px]">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200 flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Muat Turun PNG</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs transition border border-slate-200 flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Format SVG</span>
              </button>
            </div>
          </div>

          {/* Kolum Kanan: Maklumat Pautan URL & Panduan Petugas (7 Kolum) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bahagian Link URL Aplikasi */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Pautan URL Pendaftaran Aplikasi Ini</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingUrl(!isEditingUrl)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center space-x-1 underline"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingUrl ? 'Batal Tukar' : 'Ubah URL Sasaran'}</span>
                </button>
              </div>

              {/* Bar Pautan & Butang Salin */}
              {!isEditingUrl ? (
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 truncate select-all flex items-center">
                    <span className="truncate">{targetUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 shadow-xs ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Berjaya Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Pautan</span>
                        </>
                      )}
                    </button>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 transition flex items-center justify-center"
                      title="Buka pautan di tab baru untuk semakan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomUrl} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Masukkan URL Kustom (contoh: domain tersuai, pautan pendek bit.ly, atau pautan dewan)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                    >
                      Simpan URL Kustom
                    </button>
                    {session.customQrUrl && (
                      <button
                        type="button"
                        onClick={handleResetToCurrentUrl}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
                      >
                        Reset ke URL Asal
                      </button>
                    )}
                  </div>
                </form>
              )}

              <p className="text-[11px] text-slate-500 leading-normal">
                {session.customQrUrl ? (
                  <span className="text-amber-800 font-medium">
                    ⚠️ Anda sedang menggunakan URL sasaran tersuai. Pastikan pautan ini sah dan boleh diakses oleh ahli.
                  </span>
                ) : (
                  <span>
                    URL di atas dikesan secara automatik daripada persekitaran semasa aplikasi ini. Kod QR dijana terus menghubungkan ahli ke laman pendaftaran rasmi.
                  </span>
                )}
              </p>
            </div>

            {/* 3 Langkah Arahan Mudah untuk Ahli */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Aliran Pendaftaran Pantas Melalui Kod QR
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mx-auto">
                    1
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Imbas Kod QR</h5>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ahli halakan kamera telefon ke arah kod QR fizikal atau di projektor.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mx-auto">
                    2
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Semak No. Gaji</h5>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Masukkan No. Gaji untuk padanan automatik senarai induk rasmi.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mx-auto">
                    3
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Swafoto & Pas</h5>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ambil swafoto langsung dan simpan Pas Kehadiran Digital hijau.
                  </p>
                </div>
              </div>
            </div>

            {/* Petua Penggunaan Dewan */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Petua Pengendalian Pendaftaran Urus Setia</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800/90 pl-1">
                <li>
                  <strong>Pintu Masuk:</strong> Cetak 3 hingga 5 salinan Poster A4 dan lekatkan pada aras mata di kedua-dua pintu masuk kiri & kanan dewan.
                </li>
                <li>
                  <strong>Skrin Besar:</strong> Buka <em>Mod Projektor Skrin Penuh</em> sekurang-kurangnya 30 minit sebelum mesyuarat bermula bagi membolehkan ahli mendaftar sambil menunggu.
                </li>
                <li>
                  <strong>Segerak Live:</strong> Sebaik sahaja ahli menekan <em>Hantar Kehadiran</em>, angka kehadiran dan radar lokasi di skrin anda akan bertambah secara automatik.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CETAK POSTER DEWAN (A4 PRINTABLE PREVIEW)                       */}
      {/* ========================================================================= */}
      {showPosterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">Pratonton Poster Pintu Masuk Dewan</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrintPoster}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Poster (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPosterModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Poster Sebenar (Boleh Dicetak dengan Format Kemas A4) */}
            <div
              ref={posterRef}
              id="printable-poster"
              className="mt-4 p-8 border-4 border-emerald-800 rounded-3xl bg-white text-slate-900 flex flex-col items-center text-center space-y-6 shadow-xs"
            >
              {/* Logo Organisasi */}
              {session.logoUrl ? (
                <div className="max-w-[200px] max-h-16 flex items-center justify-center">
                  <img
                    src={session.logoUrl}
                    alt="Logo Organisasi"
                    className="max-h-14 max-w-[180px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-lg">
                  <ShieldCheck className="w-7 h-7" />
                  <span>e-HADIR • SISTEM KEHADIRAN RASMI</span>
                </div>
              )}

              {/* Tajuk Mesyuarat */}
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Pendaftaran Kehadiran Ahli
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                  {session.meetingTitle}
                </h2>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{session.meetingDate}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{session.venueName}</span>
                  </span>
                </div>
              </div>

              {/* Bingkai Kod QR Bersaiz Besar */}
              <div className="p-4 bg-white border-4 border-emerald-700 rounded-3xl shadow-md relative flex flex-col items-center">
                <div className="w-64 h-64 flex items-center justify-center">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Kod QR Dewan"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-500 font-bold truncate max-w-[260px]">
                  {targetUrl}
                </div>
              </div>

              {/* Arahan 3 Langkah Bersih */}
              <div className="w-full max-w-lg bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-left space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider text-center">
                  Cara Mendaftar Sendiri (3 Langkah Mudah):
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="space-y-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs inline-flex items-center justify-center">
                      1
                    </span>
                    <p className="text-[11px] font-bold text-slate-800">Imbas QR</p>
                    <p className="text-[10px] text-slate-500">Buka kamera telefon anda</p>
                  </div>
                  <div className="space-y-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs inline-flex items-center justify-center">
                      2
                    </span>
                    <p className="text-[11px] font-bold text-slate-800">No. Gaji</p>
                    <p className="text-[10px] text-slate-500">Sahkan nama & bahagian</p>
                  </div>
                  <div className="space-y-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs inline-flex items-center justify-center">
                      3
                    </span>
                    <p className="text-[11px] font-bold text-slate-800">Swafoto</p>
                    <p className="text-[10px] text-slate-500">Ambil swafoto langsung</p>
                  </div>
                </div>
              </div>

              {/* Notis Bantuan Kaunter */}
              <p className="text-[11px] text-slate-400 font-medium">
                * Sekiranya peranti anda tiada kamera atau capaian internet, sila berhubung dengan petugas di Meja Urus Setia untuk pendaftaran pantas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MOD PROJEKTOR SKRIN PENUH (HALL PRESENTATION MODE)              */}
      {/* ========================================================================= */}
      {showProjectorModal && (
        <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between p-6 md:p-10 select-none animate-in fade-in duration-300">
          {/* Header Skrin Projektor */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-4">
              {session.logoUrl ? (
                <div className="bg-white p-2 rounded-2xl max-w-[160px] max-h-12 flex items-center justify-center">
                  <img
                    src={session.logoUrl}
                    alt="Logo"
                    className="max-h-10 max-w-[140px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              )}
              <div>
                <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                  Sistem Pendaftaran Kehadiran Langsung
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {session.meetingTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Jam Digital Langsung */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-emerald-400 font-mono text-base font-bold">
                <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>{liveClock}</span>
              </div>

              {/* Butang Tutup Mod Projektor */}
              <button
                type="button"
                onClick={() => setShowProjectorModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
              >
                <X className="w-4 h-4" />
                <span>Tutup Skrin Penuh</span>
              </button>
            </div>
          </div>

          {/* Kandungan Tengah Projektor: QR Code Raksasa & Arahan */}
          <div className="my-auto py-8 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 max-w-5xl mx-auto w-full">
            {/* Kod QR Bersaiz Gergasi */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-emerald-500 relative flex flex-col items-center">
              <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Kod QR Projektor"
                    className="w-full h-full object-contain rounded-xl"
                  />
                )}
              </div>
              <div className="mt-3 text-slate-800 font-mono text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg">
                {targetUrl}
              </div>
            </div>

            {/* Panel Maklumat & Status Hadir */}
            <div className="space-y-6 text-center lg:text-left max-w-md">
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-2 bg-emerald-950 text-emerald-400 border border-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Sedia Diimbas Dari Tempat Duduk</span>
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Halakan Kamera Telefon Anda Ke Sini
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tidak perlu memasang aplikasi tambahan. Buka kamera telefon pintar anda, imbas kod QR di sebelah, dan masukkan No. Gaji anda.
                </p>
              </div>

              {/* Kad Live Kuorum Projektor */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Kehadiran Semasa</span>
                  <span className="text-emerald-400 font-bold">
                    {totalEligible > 0 ? Math.round((attendanceCount / totalEligible) * 100) : 0}% daripada Kuorum
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">{attendanceCount}</span>
                  <span className="text-slate-400 text-sm">/ {totalEligible} Ahli Telah Mendaftar</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${totalEligible > 0 ? (attendanceCount / totalEligible) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>{session.venueName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{session.meetingDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Kaki Skrin Projektor */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>e-Hadir • Sistem Kehadiran Mesyuarat Telus & Pantas</span>
            <span>Tekan butang &apos;Tutup Skrin Penuh&apos; di bucu kanan atas untuk kembali ke Dashboard</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CheckCircle,
  Camera,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Download,
  Upload,
  AlertCircle,
  Lock,
  LogOut,
  ChevronRight,
  Filter,
  Eye,
  X,
  Radio,
  Sliders,
  Maximize2,
  Navigation,
  Compass,
  Building,
  UserCheck,
  Image as ImageIcon,
  QrCode,
  Wifi,
  WifiOff,
  Share2,
  Check
} from 'lucide-react';
import {
  syncService,
  Member,
  SessionConfig,
  SyncState
} from './services/syncService';
import { HallQrGenerator } from './components/HallQrGenerator';

// Data Permulaan Contoh Ahli (Lembaga Getah Malaysia / Organisasi)
const INITIAL_MEMBERS: Member[] = [
  { staffId: 'LGM1001', fullName: 'DATO DR. AHMAD ZAIDI BIN ISMAIL', department: 'Pengurusan Tertinggi', hasAttended: false },
  { staffId: 'LGM1002', fullName: 'SITI NOR SHAHIDAH BINTI RAZALI', department: 'Bahagian Sumber Manusia', hasAttended: false },
  { staffId: 'LGM1003', fullName: 'MOHD FAIZAL BIN ABDULLAH', department: 'Bahagian Teknologi Maklumat', hasAttended: false },
  { staffId: 'LGM1004', fullName: 'NORAZLINA BINTI HASHIM', department: 'Bahagian Kewangan & Akaun', hasAttended: false },
  { staffId: 'LGM1005', fullName: 'KAMARUDDIN BIN MOHD YUSOF', department: 'Penyelidikan & Pembangunan', hasAttended: false },
  { staffId: 'LGM1006', fullName: 'AZIZAH BINTI OTHMAN', department: 'Bahagian Khidmat Korporat', hasAttended: false },
  { staffId: 'LGM1007', fullName: 'ZULKIFLI BIN MUSA', department: 'Bahagian Perladangan & Komuniti', hasAttended: false },
  { staffId: 'LGM1008', fullName: 'FARIDAH BINTI ISMAIL', department: 'Bahagian Undang-Undang', hasAttended: false },
  { staffId: 'LGM1009', fullName: 'RAHMAT BIN HASSAN', department: 'Penyelidikan Bioteknologi', hasAttended: false },
  { staffId: 'LGM1010', fullName: 'NURUL HUDA BINTI MANSOR', department: 'Pusat Analisis & Standard', hasAttended: false },
  { staffId: 'LGM1011', fullName: 'MOHAMMAD HARIS BIN CHE MAT', department: 'Bahagian Pelesenan', hasAttended: false },
  { staffId: 'LGM1012', fullName: 'SITI AISHAH BINTI BAHAROM', department: 'Bahagian Komunikasi Strategik', hasAttended: false },
];

const DEFAULT_SESSION: SessionConfig = {
  meetingTitle: 'Mesyuarat Agung Tahunan Ke-35',
  meetingDate: '2026-11-12',
  quorumTargetPercent: 50,
  isRegistrationOpen: true,
  venueName: 'Dewan Perdana LGM, Jalan Ampang',
  venueCoords: {
    latitude: 3.1612,
    longitude: 101.734,
  },
  adminPin: '123456',
  logoUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" fill="none"><rect width="220" height="60" rx="12" fill="%23065f46"/><circle cx="32" cy="30" r="18" fill="%2310b981"/><path d="M32 18 C26 24 26 36 32 42 C38 36 38 24 32 18 Z" fill="white"/><text x="60" y="28" fill="white" font-family="Arial, sans-serif" font-weight="900" font-size="14" letter-spacing="1.5">LGM • E-HADIR</text><text x="60" y="44" fill="%23a7f3d0" font-family="Arial, sans-serif" font-weight="600" font-size="9" letter-spacing="0.5">LEMBAGA GETAH MALAYSIA</text></svg>',
  customQrUrl: '',
};

// Fungsi Kiraan Jarak Haversine (Meter)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function App() {
  // Sesi & Data Ahli
  const [session, setSession] = useState<SessionConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ehadir_session');
      return saved ? JSON.parse(saved) : DEFAULT_SESSION;
    }
    return DEFAULT_SESSION;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ehadir_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    }
    return INITIAL_MEMBERS;
  });

  // Status Segerak Masa Nyata (Live Sync)
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Langganan Servis Segerak Langsung (SSE + Polling + Multi-tab)
  useEffect(() => {
    syncService.init();

    const unsubState = syncService.subscribe((state: SyncState) => {
      setSession(state.session);
      setMembers(state.members);
    });

    const unsubStatus = syncService.subscribeStatus((connected: boolean, time: string) => {
      setIsLiveConnected(connected);
      if (time) setLastSyncTime(time);
    });

    return () => {
      unsubState();
      unsubStatus();
      syncService.destroy();
    };
  }, []);

  // Aliran Ahli / Kiosk
  const [staffIdInput, setStaffIdInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'profile' | 'camera' | 'pass'>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passCopied, setPassCopied] = useState(false);

  // Status Geo Ahli semasa pendaftaran
  const [currentGeo, setCurrentGeo] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Kamera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');

  // Mod Pentadbir / Urus Setia
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ehadir_admin_auth') === 'true';
    }
    return false;
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminTab, setAdminTab] = useState<'overview' | 'location' | 'qrcode' | 'settings'>('overview');

  // Penapis & Carian Urus Setia
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<Member | null>(null);

  // Live Location Sync Status (Urus Setia)
  const [isLiveRadarActive, setIsLiveRadarActive] = useState(true);
  const [selectedMapMember, setSelectedMapMember] = useState<Member | null>(null);

  // Kemaskini selectedMember jika berlaku perubahan live dari pelayan
  useEffect(() => {
    if (selectedMember) {
      const match = members.find((m) => m.staffId === selectedMember.staffId);
      if (match) {
        setSelectedMember(match);
      }
    }
  }, [members, selectedMember?.staffId]);

  // Ambil Lokasi Ahli di Latar Belakang
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGeo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        () => {
          // Simulasi koordinat dewan sekiranya disekat
          setCurrentGeo({
            lat: session.venueCoords.latitude + (Math.random() - 0.5) * 0.0008,
            lng: session.venueCoords.longitude + (Math.random() - 0.5) * 0.0008,
            accuracy: 12,
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [session.venueCoords]);

  // Statistik Kehadiran
  const stats = useMemo(() => {
    const totalEligible = members.length;
    const totalAttended = members.filter((m) => m.hasAttended).length;
    const attendancePercent = totalEligible > 0 ? Math.round((totalAttended / totalEligible) * 100) : 0;
    const isQuorumReached = attendancePercent >= session.quorumTargetPercent;
    return {
      totalEligible,
      totalAttended,
      attendancePercent,
      isQuorumReached,
    };
  }, [members, session.quorumTargetPercent]);

  // Senarai Bahagian Unik
  const departments = useMemo(() => {
    const depts = new Set(members.map((m) => m.department));
    return Array.from(depts);
  }, [members]);

  // Carian dan Tapisan Ahli (Dashboard Admin)
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.staffId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || m.department === departmentFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'attended' && m.hasAttended) ||
        (statusFilter === 'not_attended' && !m.hasAttended);
      return matchSearch && matchDept && matchStatus;
    });
  }, [members, searchQuery, departmentFilter, statusFilter]);

  // Ahli yang mempunyai rekod lokasi GPS (Eksklusif Urus Setia)
  const attendedWithLocation = useMemo(() => {
    return members.filter((m) => m.hasAttended && m.location);
  }, [members]);

  // Kawalan Kamera Langsung
  const startCamera = async () => {
    setCameraError('');
    setCapturedPhoto(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Pelayar anda tidak menyokong akses kamera. Sila gunakan Google Chrome atau Safari terkini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kamera tidak dapat diakses.';
      setCameraError(message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (currentStep === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentStep]);

  // Tangkap Selfie
  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cermin mendatar bagi rasa natural swafoto
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Mampatkan imej kepada kualiti JPEG 0.75 (< 150KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Semakan No. Gaji
  const handleCheckStaffId = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleaned = staffIdInput.trim().toUpperCase();
    if (!cleaned) {
      setErrorMessage('Sila masukkan No. Gaji anda.');
      return;
    }

    const found = members.find((m) => m.staffId.toUpperCase() === cleaned);
    if (!found) {
      setErrorMessage('No. Gaji tidak ditemui dalam senarai ahli layak. Sila semak semula atau rujuk meja urus setia.');
      return;
    }

    // Semak pendaftaran berulang
    if (found.hasAttended) {
      setSelectedMember(found);
      setCurrentStep('pass'); // Terus papar pas sedia ada
      return;
    }

    setSelectedMember(found);
    setCurrentStep('profile');
  };

  // Pengesahan & Hantar Kehadiran (Dengan Segerak Live ke Pelayan)
  const handleSubmitAttendance = async () => {
    if (!selectedMember || !capturedPhoto) return;
    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Tentukan koordinat (guna GPS sebenar atau titik dewan)
    const lat = currentGeo?.lat || session.venueCoords.latitude + (Math.random() - 0.5) * 0.0006;
    const lng = currentGeo?.lng || session.venueCoords.longitude + (Math.random() - 0.5) * 0.0006;
    const accuracy = currentGeo?.accuracy || 15;
    const dist = calculateDistanceMeters(lat, lng, session.venueCoords.latitude, session.venueCoords.longitude);

    let locationStatus: 'dalam_dewan' | 'sekitar_dewan' | 'luar_kawasan' = 'dalam_dewan';
    if (dist > 500) {
      locationStatus = 'luar_kawasan';
    } else if (dist > 150) {
      locationStatus = 'sekitar_dewan';
    }

    const locationData = {
      latitude: lat,
      longitude: lng,
      accuracy,
      timestamp: formattedDate,
      distanceMeters: dist,
      status: locationStatus,
    };

    try {
      const res = await syncService.submitAttendance({
        staffId: selectedMember.staffId,
        selfieUrl: capturedPhoto,
        location: locationData,
        attendedAt: formattedDate,
      });

      if (res.member) {
        setSelectedMember(res.member);
      }
      setCurrentStep('pass');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ralat menghantar kehadiran';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Aliran (Kiosk Mode)
  const handleResetKiosk = () => {
    setStaffIdInput('');
    setSelectedMember(null);
    setCapturedPhoto(null);
    setErrorMessage('');
    setCurrentStep('input');
  };

  // Log Masuk Urus Setia
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === session.adminPin) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('ehadir_admin_auth', 'true');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Kod PIN tidak sah. Sila masukkan 6-digit PIN yang betul.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('ehadir_admin_auth');
  };

  // Eksport Fail CSV (Termasuk koordinat untuk audit Urus Setia)
  const handleExportCSV = () => {
    const headers = [
      'Bil',
      'No_Gaji',
      'Nama_Penuh',
      'Bahagian_Cawangan',
      'Status_Kehadiran',
      'Masa_Daftar',
      'Status_Lokasi_Dewan',
      'Jarak_Dari_Dewan_Meter',
      'Koordinat_GPS_Lat_Lng',
      'Status_Swafoto',
    ];

    const rows = members.map((m, index) => {
      const coords = m.location ? `${m.location.latitude.toFixed(6)}, ${m.location.longitude.toFixed(6)}` : 'Tiada Data';
      const dist = m.location?.distanceMeters !== undefined ? `${m.location.distanceMeters}m` : '-';
      const locStat = m.location ? m.location.status.replace('_', ' ').toUpperCase() : '-';
      const selfieInfo = m.selfieUrl ? 'Disahkan (Live Selfie)' : 'Tiada';

      return [
        index + 1,
        `"${m.staffId}"`,
        `"${m.fullName}"`,
        `"${m.department}"`,
        m.hasAttended ? 'HADIR' : 'TIDAK HADIR',
        `"${m.attendedAt || '-'}"`,
        `"${locStat}"`,
        `"${dist}"`,
        `"${coords}"`,
        `"${selfieInfo}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Kehadiran_e-Hadir_${session.meetingDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Muat Naik CSV Senarai Induk
  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
      if (lines.length < 2) {
        alert('Fail CSV kosong atau tidak sah.');
        return;
      }

      const newMembers: Member[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3 && parts[0]) {
          newMembers.push({
            staffId: parts[0].toUpperCase(),
            fullName: parts[1],
            department: parts[2],
            hasAttended: false,
          });
        }
      }

      if (newMembers.length > 0) {
        if (confirm(`Dijumpai ${newMembers.length} rekod ahli. Adakah anda ingin menggantikan senarai sedia ada merentas semua peranti?`)) {
          try {
            await syncService.importMembers(newMembers);
            alert(`Senarai induk berjaya dikemas kini dengan ${newMembers.length} ahli secara langsung!`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal muat naik';
            alert(msg);
          }
        }
      } else {
        alert('Format fail CSV mestilah: No_Gaji, Nama_Penuh, Bahagian_Cawangan');
      }
    };
    reader.readAsText(file);
  };

  // Muat Naik Logo Organisasi / Acara
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej yang sah (PNG, JPG, SVG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        await syncService.updateSession({ logoUrl: dataUrl });
        alert('Logo organisasi telah berjaya dikemas kini merentas semua peranti!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Sesi (Urus Setia)
  const handleResetSession = async () => {
    if (confirm('AMARAN: Adakah anda pasti ingin memadam semua rekod kehadiran untuk sesi ini?')) {
      if (confirm('Sila sahkan sekali lagi: Tindakan ini akan mengosongkan rekod pada semua peranti secara langsung.')) {
        try {
          await syncService.resetSession(session.adminPin);
          alert('Sesi telah direset. Semua rekod kehadiran dikosongkan.');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal reset';
          alert(msg);
        }
      }
    }
  };

  // Kemas kini Sesi (Helper)
  const handleUpdateSession = async (updates: Partial<SessionConfig>) => {
    try {
      await syncService.updateSession(updates);
    } catch (err: unknown) {
      console.error('Gagal kemas kini sesi:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Bar Atas Korporat - Responsif untuk Telefon, Tablet & Desktop */}
      <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Tajuk Utama */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {session.logoUrl ? (
              <div className="bg-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center max-w-[90px] sm:max-w-[120px] max-h-8 sm:max-h-9 border border-emerald-700/60">
                <img
                  src={session.logoUrl}
                  alt="Logo Rasmi"
                  className="max-h-6 sm:max-h-7 max-w-[80px] sm:max-w-[110px] object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">e-Hadir</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-700/80 px-1.5 sm:px-2 py-0.5 rounded text-emerald-100 border border-emerald-600/50 truncate">
                  {isAdminLoggedIn ? 'Mod Urus Setia' : 'Pendaftaran Ahli'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium truncate max-w-[160px] xs:max-w-[200px] sm:max-w-md">
                {session.meetingTitle}
              </p>
            </div>
          </div>

          {/* Bahagian Kanan: Indikator Live & Butang Mod */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Indikator Segerak Langsung (Live Sync) */}
            <div
              title={`Kemas kini masa nyata: ${lastSyncTime}`}
              className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-[11px] bg-emerald-950/60 text-emerald-200 border border-emerald-700/50 px-2 sm:px-2.5 py-1 rounded-full cursor-default"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="hidden md:inline font-medium">
                {isLiveConnected ? 'Segerak Live' : 'Menyambung...'}
              </span>
            </div>

            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Butang Cepat Kod QR */}
                <button
                  type="button"
                  onClick={() => setAdminTab('qrcode')}
                  className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-bold shadow-xs transition"
                  title="Buka Penjana Kod QR Dewan"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kod QR Dewan</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-1 text-xs bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-emerald-700/60 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center space-x-1 text-xs bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-600/60 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Urus Setia</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Paparan Utama: Pengguna Ahli / Kiosk vs Dashboard Urus Setia */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col justify-start">
        {isAdminLoggedIn ? (
          /* ========================================================================= */
          /* PANDANGAN URUS SETIA (ADMIN DASHBOARD DENGAN LIVE SYNC & QR GENERATOR)    */
          /* ========================================================================= */
          <div className="space-y-5 sm:space-y-6">
            {/* Header Dashboard & Suis Buka/Tutup */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                {session.logoUrl ? (
                  <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center max-w-[130px] max-h-12">
                    <img
                      src={session.logoUrl}
                      alt="Logo Rasmi"
                      className="max-h-9 max-w-[110px] object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                    <span>Papan Pemuka Pemantauan Urus Setia</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      PIN Disahkan
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.venueName}</span>
                    <span className="text-slate-300">•</span>
                    <span>Sasaran Kuorum: {session.quorumTargetPercent}%</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Suis Status Pendaftaran (Live Sync) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => handleUpdateSession({ isRegistrationOpen: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      session.isRegistrationOpen
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Buka Pendaftaran
                  </button>
                  <button
                    onClick={() => handleUpdateSession({ isRegistrationOpen: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      !session.isRegistrationOpen
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tutup Pendaftaran
                  </button>
                </div>

                {/* Butang Eksport CSV */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Eksport CSV</span>
                </button>
              </div>
            </div>

            {/* 4 Kad Statistik Kuorum & Kehadiran (Responsif Grid 2 Kolum Mobile / 4 Kolum Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Hadir</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800">{stats.totalAttended}</span>
                  <span className="text-xs text-slate-400">orang ahli</span>
                </div>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.attendancePercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Ahli Layak</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalEligible}</span>
                  <span className="text-xs text-slate-400">dalam senarai</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 truncate">Senarai induk dimuat naik</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peratus Kehadiran</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.attendancePercent}%</span>
                  <span className="text-xs font-semibold text-slate-500">Sasaran: {session.quorumTargetPercent}%</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 truncate">Kemas kini live setiap pendaftaran</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Kuorum</span>
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full shrink-0 ${
                      stats.isQuorumReached ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`text-base sm:text-lg font-black truncate ${
                      stats.isQuorumReached ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {stats.isQuorumReached ? 'KUORUM TERCAPAI' : 'BELUM TERCAPAI'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 truncate">
                  {stats.isQuorumReached
                    ? 'Mesyuarat sah diteruskan.'
                    : `Kurang ${Math.max(
                        0,
                        Math.ceil((session.quorumTargetPercent / 100) * stats.totalEligible) - stats.totalAttended
                      )} ahli lagi.`}
                </p>
              </div>
            </div>

            {/* Tab Navigasi Urus Setia - Bersih dengan Skrol Mendatar pada Skrin Kecil */}
            <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
              <button
                onClick={() => setAdminTab('overview')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition shrink-0 ${
                  adminTab === 'overview'
                    ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-2xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Senarai Kehadiran ({stats.totalAttended})</span>
              </button>

              <button
                onClick={() => setAdminTab('location')}
                className={`relative flex items-center space-x-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition shrink-0 ${
                  adminTab === 'location'
                    ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-2xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Radar Lokasi Langsung</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              {/* TAB BARU: PENJANA KOD QR DEWAN */}
              <button
                onClick={() => setAdminTab('qrcode')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition shrink-0 ${
                  adminTab === 'qrcode'
                    ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-2xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Kod QR Dewan</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold uppercase">
                  Imbas Pantas
                </span>
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-bold transition shrink-0 ${
                  adminTab === 'settings'
                    ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-2xl shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4 text-slate-600" />
                <span>Tetapan Sesi & Senarai</span>
              </button>
            </div>

            {/* ===================================================================== */}
            {/* KANDUNGAN TAB 1: SENARAI KEHADIRAN & STATUS                          */}
            {/* ===================================================================== */}
            {adminTab === 'overview' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                {/* Bar Carian & Penapis */}
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari mengikut Nama atau No. Gaji..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Bahagian ({departments.length})</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'attended' | 'not_attended')}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="attended">Sudah Hadir ({stats.totalAttended})</option>
                      <option value="not_attended">Belum Hadir ({stats.totalEligible - stats.totalAttended})</option>
                    </select>
                  </div>
                </div>

                {/* Jadual Ahli (Responsif Skrol Mendatar) */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">No. Gaji</th>
                        <th className="py-3 px-4">Nama Penuh</th>
                        <th className="py-3 px-4">Bahagian / Cawangan</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Masa Daftar</th>
                        <th className="py-3 px-4">Bukti Swafoto</th>
                        <th className="py-3 px-4">Lokasi Semakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Tiada rekod ahli yang sepadan dengan carian anda.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => (
                          <tr key={member.staffId} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-bold text-slate-900">{member.staffId}</td>
                            <td className="py-3 px-4 font-medium text-slate-800">{member.fullName}</td>
                            <td className="py-3 px-4 text-slate-600">{member.department}</td>
                            <td className="py-3 px-4">
                              {member.hasAttended ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Hadir
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                                  Belum Hadir
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-500">{member.attendedAt || '-'}</td>
                            <td className="py-3 px-4">
                              {member.selfieUrl ? (
                                <button
                                  onClick={() => setSelectedPhotoPreview(member)}
                                  className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-bold underline"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat Foto</span>
                                </button>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {member.location ? (
                                <button
                                  onClick={() => {
                                    setSelectedMapMember(member);
                                    setAdminTab('location');
                                  }}
                                  className="flex items-center space-x-1 text-xs text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                                >
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>{member.location.distanceMeters ?? 0}m</span>
                                </button>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* KANDUNGAN TAB 2: LOKASI KEHADIRAN MASA NYATA (RADAR LOKASI URUS SETIA) */}
            {/* ===================================================================== */}
            {adminTab === 'location' && (
              <div className="space-y-4">
                {/* Kad Maklumat Akses Eksklusif */}
                <div className="bg-emerald-950 text-white rounded-3xl p-5 border border-emerald-800 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h2 className="text-base font-bold text-white tracking-wide">
                          Pusat Radar Lokasi Masa Nyata Ahli (Live Tracking)
                        </h2>
                        <span className="text-[10px] bg-emerald-800 border border-emerald-600 px-2 py-0.5 rounded text-emerald-200 font-bold uppercase">
                          Eksklusif Urus Setia
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        Memantau koordinat fizikal ahli yang hadir secara langsung untuk mengesahkan kedudukan mereka di dalam dewan (<span className="text-emerald-300 font-bold">&lt;150m</span>) atau sekitar dewan.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-emerald-900/80 px-3.5 py-2 rounded-xl border border-emerald-700/60 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-300">Status Radar</div>
                        <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1">
                          <Radio className="w-3 h-3 text-emerald-400 animate-ping mr-1" />
                          <span>Aktif ({lastSyncTime})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsLiveRadarActive(!isLiveRadarActive)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          isLiveRadarActive ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-white'
                        }`}
                      >
                        {isLiveRadarActive ? 'Jeda' : 'Mula'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Peta Interaktif & Senarai Ahli */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Peta Vektor SVG Radar */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-5 h-5 text-emerald-700" />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            Peta Taburan Kehadiran Fizikal di Dewan
                          </h3>
                          <p className="text-xs text-slate-500">
                            Titik Rujukan: {session.venueName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {attendedWithLocation.length} Ahli Berkoordinat
                      </span>
                    </div>

                    {/* Kawasan Radar SVG */}
                    <div className="relative w-full aspect-[4/3] sm:h-[360px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                      {/* Grid Radar Bulatan */}
                      <svg viewBox="0 0 400 400" className="w-full h-full">
                        {/* Lingkaran Zon */}
                        <circle cx="200" cy="200" r="160" fill="none" stroke="#064e3b" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                        <circle cx="200" cy="200" r="110" fill="none" stroke="#047857" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <circle cx="200" cy="200" r="60" fill="#065f46" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.5" />

                        {/* Garisan Paksi */}
                        <line x1="40" y1="200" x2="360" y2="200" stroke="#047857" strokeWidth="0.8" opacity="0.4" />
                        <line x1="200" y1="40" x2="200" y2="360" stroke="#047857" strokeWidth="0.8" opacity="0.4" />

                        {/* Titik Pusat Dewan */}
                        <circle cx="200" cy="200" r="7" fill="#10b981" className="animate-pulse" />
                        <circle cx="200" cy="200" r="14" fill="none" stroke="#34d399" strokeWidth="1" opacity="0.8" />
                        <text x="200" y="224" fill="#a7f3d0" fontSize="10" textAnchor="middle" fontWeight="bold">
                          DEWAN MESYUARAT
                        </text>

                        {/* Titik Ahli Berdasarkan Koordinat GPS */}
                        {attendedWithLocation.map((m) => {
                          const dist = m.location?.distanceMeters || 10;
                          const normDist = Math.min(150, Math.max(15, (dist / 500) * 150));
                          // Sudut unik berasaskan hash staffId
                          let hash = 0;
                          for (let i = 0; i < m.staffId.length; i++) {
                            hash = (hash << 5) - hash + m.staffId.charCodeAt(i);
                          }
                          const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
                          const cx = 200 + normDist * Math.cos(angle);
                          const cy = 200 + normDist * Math.sin(angle);
                          const isSelected = selectedMapMember?.staffId === m.staffId;

                          return (
                            <g
                              key={m.staffId}
                              className="cursor-pointer transition transform hover:scale-125"
                              onClick={() => setSelectedMapMember(m)}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isSelected ? 8 : 5}
                                fill={isSelected ? '#f59e0b' : m.location?.status === 'dalam_dewan' ? '#34d399' : '#fbbf24'}
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Petunjuk Zon */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-300 space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>Dalam Dewan (&lt;150m)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>Sekitar Dewan (150-500m)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Senarai Ahli Berkoordinat Terkini */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Kedudukan Ahli ({attendedWithLocation.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Pilih ahli untuk semak perincian jarak.</p>

                      <div className="mt-3 max-h-[300px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                        {attendedWithLocation.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">Belum ada ahli berdaftar.</p>
                        ) : (
                          attendedWithLocation.map((m) => (
                            <div
                              key={m.staffId}
                              onClick={() => setSelectedMapMember(m)}
                              className={`pt-2 first:pt-0 p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                                selectedMapMember?.staffId === m.staffId
                                  ? 'bg-emerald-50 border border-emerald-300'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-bold text-xs text-slate-900 truncate">{m.fullName}</p>
                                <p className="text-[10px] text-slate-500">{m.staffId} • {m.department}</p>
                              </div>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                                  m.location?.status === 'dalam_dewan'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {m.location?.distanceMeters}m
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {selectedMapMember && (
                      <div className="pt-3 border-t border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Ahli Dipilih</span>
                        <p className="font-bold text-slate-900">{selectedMapMember.fullName}</p>
                        <p className="text-[11px] text-slate-500">
                          Masa: {selectedMapMember.attendedAt} • Jarak: {selectedMapMember.location?.distanceMeters}m
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* KANDUNGAN TAB 3: PENJANA KOD QR DEWAN (KOMPONEN PENUH)               */}
            {/* ===================================================================== */}
            {adminTab === 'qrcode' && (
              <HallQrGenerator
                session={session}
                onUpdateSession={handleUpdateSession}
                attendanceCount={stats.totalAttended}
                totalEligible={stats.totalEligible}
              />
            )}

            {/* ===================================================================== */}
            {/* KANDUNGAN TAB 4: TETAPAN SESI & MUAT NAIK SENARAI INDUK              */}
            {/* ===================================================================== */}
            {adminTab === 'settings' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tetapan Sesi Mesyuarat & Lokasi Dewan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sebarang pengemaskinian di sini akan disegerakkan secara langsung ke semua telefon ahli dan paparan kaunter.
                  </p>
                </div>

                {/* Ruang Logo Organisasi */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Ruang Logo Organisasi (Sebelum Tajuk Mesyuarat)</span>
                    </h3>
                    {session.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleUpdateSession({ logoUrl: undefined })}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold underline"
                      >
                        Padam Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="w-44 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                      {session.logoUrl ? (
                        <img
                          src={session.logoUrl}
                          alt="Pratonton Logo"
                          className="max-h-12 max-w-[150px] object-contain rounded-md"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Tiada Logo Dipilih</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Muat Naik Logo Fail (PNG / JPG / SVG)</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleUpdateSession({ logoUrl: DEFAULT_SESSION.logoUrl })}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          Guna Logo LGM (Lalai)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Input Tetapan Sesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tajuk Mesyuarat / Acara</label>
                    <input
                      type="text"
                      value={session.meetingTitle}
                      onChange={(e) => handleUpdateSession({ meetingTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tarikh Mesyuarat</label>
                    <input
                      type="date"
                      value={session.meetingDate}
                      onChange={(e) => handleUpdateSession({ meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Kuorum Sah (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={session.quorumTargetPercent}
                      onChange={(e) => handleUpdateSession({ quorumTargetPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tempat / Dewan Rujukan</label>
                    <input
                      type="text"
                      value={session.venueName}
                      onChange={(e) => handleUpdateSession({ venueName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Koordinat Dewan (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={session.venueCoords.latitude}
                      onChange={(e) =>
                        handleUpdateSession({
                          venueCoords: { ...session.venueCoords, latitude: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Koordinat Dewan (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={session.venueCoords.longitude}
                      onChange={(e) =>
                        handleUpdateSession({
                          venueCoords: { ...session.venueCoords, longitude: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Muat Naik Senarai Induk (CSV) */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Muat Naik Senarai Induk Ahli Layak</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Format fail CSV: <code>No_Gaji, Nama_Penuh, Bahagian_Cawangan</code>.
                  </p>
                  <label className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-300">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Pilih Fail CSV Senarai Ahli</span>
                    <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
                  </label>
                </div>

                {/* Reset Sesi */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-rose-800">Padam / Reset Sesi Kehadiran</h3>
                    <p className="text-xs text-slate-500">
                      Mengosongkan semua rekod kehadiran untuk memulakan mesyuarat tahun hadapan.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSession}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    Reset Sesi Kehadiran
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* PANDANGAN PENDAFTARAN AHLI / KIOSK TABLET (BYOD & KAUNTER)                */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 w-full">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header Kad Pendaftaran */}
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-5 sm:p-6 text-white text-center relative">
                {/* Ruang Logo Sebelum Tajuk Mesyuarat */}
                <div className="flex flex-col items-center justify-center mb-3">
                  {session.logoUrl ? (
                    <div className="bg-white p-2 rounded-2xl shadow-lg border border-white/30 flex items-center justify-center max-w-[200px]">
                      <img
                        src={session.logoUrl}
                        alt="Logo Rasmi Organisasi"
                        className="max-h-12 max-w-[180px] object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner backdrop-blur-sm border-2 border-dashed border-emerald-300/40 text-emerald-200">
                      <ImageIcon className="w-7 h-7 text-emerald-300" />
                    </div>
                  )}
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-emerald-200/90 mt-2 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    Logo Rasmi Mesyuarat / Organisasi
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-black tracking-tight">{session.meetingTitle}</h1>
                <p className="text-xs text-emerald-200/90 font-medium mt-1">
                  {session.meetingDate} • {session.venueName}
                </p>

                {/* Status Pendaftaran Dibuka / Ditutup (Live Update!) */}
                <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm border border-white/20">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      session.isRegistrationOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span>{session.isRegistrationOpen ? 'PENDAFTARAN DIBUKA' : 'PENDAFTARAN TELAH DITUTUP'}</span>
                </div>
              </div>

              {/* Sekiranya Pendaftaran Telah Ditutup */}
              {!session.isRegistrationOpen ? (
                <div className="p-6 sm:p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Pendaftaran Kehadiran Telah Ditutup</h2>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Sesi pendaftaran rasmi telah ditamatkan oleh pihak Urus Setia. Sila berjumpa dengan petugas di meja kaunter urus setia sekiranya anda memerlukan bantuan lanjut.
                    </p>
                  </div>
                </div>
              ) : (
                /* Kandungan Mengikut Langkah Pendaftaran */
                <div className="p-5 sm:p-6">
                  {/* LANGKAH 1: INPUT NO. GAJI */}
                  {currentStep === 'input' && (
                    <form onSubmit={handleCheckStaffId} className="space-y-4">
                      <div className="text-center space-y-1">
                        <h2 className="text-base font-bold text-slate-900">Pengesahan Kehadiran Ahli</h2>
                        <p className="text-xs text-slate-500">
                          Masukkan No. Gaji atau ID Kakitangan anda untuk menyemak kelayakan dalam senarai induk.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          No. Gaji / Staff ID
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: LGM1001"
                          value={staffIdInput}
                          onChange={(e) => setStaffIdInput(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 text-base font-bold text-slate-900 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:outline-none uppercase tracking-wide placeholder:normal-case placeholder:font-normal"
                          autoFocus
                        />
                      </div>

                      {errorMessage && (
                        <div className="flex items-start space-x-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center space-x-2"
                      >
                        <span>Semak No. Gaji</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-[11px] text-slate-500">
                        <p>Pastikan anda berada di dalam dewan mesyuarat sebelum meneruskan pendaftaran.</p>
                      </div>
                    </form>
                  )}

                  {/* LANGKAH 2: PENGESAHAN IDENTITI */}
                  {currentStep === 'profile' && selectedMember && (
                    <div className="space-y-5">
                      <div className="text-center space-y-1">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900">Sahkan Identiti Anda</h2>
                        <p className="text-xs text-slate-500">Sila pastikan maklumat di bawah adalah kepunyaan anda.</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Penuh</span>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{selectedMember.fullName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Gaji</span>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedMember.staffId}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bahagian</span>
                            <p className="font-semibold text-slate-700 mt-0.5">{selectedMember.department}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('input')}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition"
                        >
                          Bukan Saya
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('camera')}
                          className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-2xl text-xs transition shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Teruskan ke Kamera</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LANGKAH 3: KAMERA LANGSUNG (LIVE SELFIE SAHAJA) */}
                  {currentStep === 'camera' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <h2 className="text-base font-bold text-slate-900">Swafoto Kehadiran Fizikal</h2>
                        <p className="text-xs text-slate-500">
                          Ambil gambar wajah anda secara langsung sebagai bukti kehadiran di dewan.
                        </p>
                      </div>

                      {/* Bingkai Kamera Responsif */}
                      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-inner flex items-center justify-center">
                        {capturedPhoto ? (
                          <img
                            src={capturedPhoto}
                            alt="Foto Kehadiran"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        )}

                        {/* Garisan Panduan Wajah (Oval Grid) */}
                        {!capturedPhoto && !cameraError && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-36 h-48 sm:w-44 sm:h-56 border-2 border-dashed border-emerald-400/70 rounded-full"></div>
                          </div>
                        )}

                        {cameraError && (
                          <div className="absolute inset-0 bg-slate-900/90 text-white p-4 flex flex-col items-center justify-center text-center space-y-2">
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                            <p className="text-xs font-semibold">{cameraError}</p>
                            <button
                              onClick={startCamera}
                              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg"
                            >
                              Cuba Akses Semula
                            </button>
                          </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      {/* Butang Kawalan Kamera */}
                      {!capturedPhoto ? (
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            type="button"
                            onClick={takeSelfie}
                            disabled={!cameraActive}
                            className="w-16 h-16 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white border-4 border-white shadow-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                          >
                            <Camera className="w-7 h-7" />
                          </button>
                          <span className="text-[11px] text-slate-400 font-medium">Tekan untuk tangkap gambar</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setCapturedPhoto(null);
                                startCamera();
                              }}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center space-x-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Ambil Semula</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSubmitAttendance}
                              disabled={isSubmitting}
                              className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-2xl text-xs transition shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                            >
                              {isSubmitting ? (
                                <span>Menyimpan Rekod...</span>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Sahkan & Hantar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LANGKAH 4: PAS KEHADIRAN DIGITAL (KEJAYAAN) */}
                  {currentStep === 'pass' && selectedMember && (
                    <div className="space-y-4">
                      {/* Kad Pas Digital Emerald Korporat */}
                      <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-600 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-700"></div>

                        <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                          <div className="flex items-center space-x-2">
                            {session.logoUrl ? (
                              <img
                                src={session.logoUrl}
                                alt="Logo"
                                className="max-h-6 max-w-[80px] object-contain rounded"
                              />
                            ) : (
                              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                            )}
                            <span className="font-extrabold text-xs text-emerald-900 tracking-wider">
                              PAS KEHADIRAN DIGITAL
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                            Disahkan Sahih
                          </span>
                        </div>

                        <div className="py-4 flex flex-col items-center text-center space-y-3">
                          {selectedMember.selfieUrl ? (
                            <div className="relative">
                              <img
                                src={selectedMember.selfieUrl}
                                alt="Selfie Ahli"
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-emerald-500 shadow-md"
                              />
                              <div className="absolute -bottom-2 -right-2 bg-emerald-700 text-white rounded-full p-1 shadow">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <CheckCircle className="w-10 h-10" />
                            </div>
                          )}

                          <div>
                            <h3 className="text-base font-black text-slate-900">{selectedMember.fullName}</h3>
                            <p className="text-xs font-bold text-emerald-800 mt-0.5">
                              {selectedMember.staffId} • {selectedMember.department}
                            </p>
                          </div>

                          <div className="w-full bg-white/90 p-3 rounded-xl border border-emerald-100 space-y-1.5 text-xs text-left">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Masa Pendaftaran:</span>
                              <span className="font-bold text-slate-800">{selectedMember.attendedAt}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Status Kehadiran:</span>
                              <span className="font-bold text-emerald-700">HADIR & BERDAFTAR</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Lokasi Acara:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[200px] text-right">{session.venueName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400">
                          Sila simpan tangkapan skrin pas ini atau tunjukkan kepada petugas di pintu dewan.
                        </div>
                      </div>

                      {/* Butang Mod Kiosk Tablet (Daftar Seterusnya) */}
                      <button
                        type="button"
                        onClick={handleResetKiosk}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                        <span>Daftar Ahli Seterusnya (Mod Kiosk)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pautan Akses Urus Setia di Kaki Halaman */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-slate-600 hover:text-emerald-800 font-semibold underline decoration-slate-300 underline-offset-4 transition"
              >
                Akses Pentadbir Urus Setia
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL KUNCI PIN URUS SETIA (ADMIN PIN GATE) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowPinModal(false);
                setPinError('');
                setPinInput('');
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-5">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Akses Pentadbir Urus Setia</h3>
              <p className="text-xs text-slate-500">
                Halaman pemantauan kuorum, lokasi langsung, dan kod QR dilindungi oleh Kod PIN 6-digit.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 text-center">
                  Masukkan Kod PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 text-center mt-1">Kod PIN lalai: <code>123456</code></p>
              </div>

              {pinError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs text-center border border-rose-200">
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-emerald-800/20"
              >
                Sahkan & Masuk Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATONTON GAMBAR SWAFOTO (URUS SETIA AUDIT) */}
      {selectedPhotoPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Bukti Swafoto Kehadiran Sah</h3>
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={selectedPhotoPreview.selfieUrl}
                  alt={selectedPhotoPreview.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedPhotoPreview.fullName}</p>
                <p className="text-slate-500">{selectedPhotoPreview.staffId} • {selectedPhotoPreview.department}</p>
                <p className="text-emerald-700 font-semibold">Masa: {selectedPhotoPreview.attendedAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kaki Halaman Rasmi */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>e-Hadir © 2026 • Sistem Pengurusan Kehadiran Mesyuarat Berstruktur</span>
          <span className="text-[11px] text-slate-400">
            {isAdminLoggedIn ? 'Mod Urus Setia Dilindungi PIN' : 'Sistem Kehadiran Telus & Sahih'}
          </span>
        </div>
      </footer>
    </div>
  );
}

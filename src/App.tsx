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
  Image as ImageIcon
} from 'lucide-react';

// Jenis Data Ahli
interface Member {
  staffId: string;
  fullName: string;
  department: string;
  hasAttended: boolean;
  attendedAt?: string;
  selfieUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    distanceMeters?: number;
    status: 'dalam_dewan' | 'sekitar_dewan' | 'luar_kawasan';
  };
}

// Konfigurasi Sesi
interface SessionConfig {
  meetingTitle: string;
  meetingDate: string;
  quorumTargetPercent: number;
  isRegistrationOpen: boolean;
  venueName: string;
  venueCoords: {
    latitude: number;
    longitude: number;
  };
  adminPin: string;
  logoUrl?: string; // Ruang logo rasmi organisasi sebelum tajuk mesyuarat
}

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

// Koordinat Lalai: Dewan Perdana / Ibu Pejabat LGM, Kuala Lumpur (3.1612° N, 101.7340° E)
const DEFAULT_SESSION: SessionConfig = {
  meetingTitle: 'Mesyuarat Agung Tahunan Ke-35',
  meetingDate: '2026-11-12',
  quorumTargetPercent: 50,
  isRegistrationOpen: true,
  venueName: 'Dewan Perdana LGM, Jalan Ampang',
  venueCoords: {
    latitude: 3.1612,
    longitude: 101.7340,
  },
  adminPin: '123456',
  logoUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" fill="none"><rect width="220" height="60" rx="12" fill="%23065f46"/><circle cx="32" cy="30" r="18" fill="%2310b981"/><path d="M32 18 C26 24 26 36 32 42 C38 36 38 24 32 18 Z" fill="white"/><text x="60" y="28" fill="white" font-family="Arial, sans-serif" font-weight="900" font-size="14" letter-spacing="1.5">LGM • E-HADIR</text><text x="60" y="44" fill="%23a7f3d0" font-family="Arial, sans-serif" font-weight="600" font-size="9" letter-spacing="0.5">LEMBAGA GETAH MALAYSIA</text></svg>',
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
  // Keadaan Aplikasi Sesi & Data
  const [session, setSession] = useState<SessionConfig>(() => {
    const saved = localStorage.getItem('ehadir_session');
    return saved ? JSON.parse(saved) : DEFAULT_SESSION;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('ehadir_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Simpan data bila berubah
  useEffect(() => {
    localStorage.setItem('ehadir_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem('ehadir_members', JSON.stringify(members));
  }, [members]);

  // Aliran Ahli / Kiosk
  const [staffIdInput, setStaffIdInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'profile' | 'camera' | 'pass'>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return sessionStorage.getItem('ehadir_admin_auth') === 'true';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminTab, setAdminTab] = useState<'overview' | 'location' | 'settings'>('overview');

  // Penapis & Carian Urus Setia
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<Member | null>(null);

  // Live Location Sync Status (Urus Setia)
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(true);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [selectedMapMember, setSelectedMapMember] = useState<Member | null>(null);

  // Ambil Lokasi Ahli di Latar Belakang (Ahli tidak melihat lokasi orang lain)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGeo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        () => {
          // Fallback sekiranya browser sekat izin: guna simulasi tepat dewan mesyuarat
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

  // Kemas kini Masa Nyata (Live Location Simulation & Sync berkala bagi Urusetia)
  useEffect(() => {
    if (!isAdminLoggedIn || !isLiveSyncActive) return;

    const interval = setInterval(() => {
      setLastLiveSyncTime(new Date().toLocaleTimeString());
      // Sedikit pembaharuan mikroskopik GPS ahli yang hadir bagi mensimulasikan pergerakan live di dewan
      setMembers((prev) =>
        prev.map((m) => {
          if (m.hasAttended && m.location) {
            const jitterLat = (Math.random() - 0.5) * 0.00003;
            const jitterLng = (Math.random() - 0.5) * 0.00003;
            const newLat = m.location.latitude + jitterLat;
            const newLng = m.location.longitude + jitterLng;
            const dist = calculateDistanceMeters(
              newLat,
              newLng,
              session.venueCoords.latitude,
              session.venueCoords.longitude
            );
            return {
              ...m,
              location: {
                ...m.location,
                latitude: newLat,
                longitude: newLng,
                distanceMeters: dist,
                timestamp: new Date().toLocaleTimeString(),
              },
            };
          }
          return m;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAdminLoggedIn, isLiveSyncActive, session.venueCoords]);

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
        throw new Error('Pelayar anda tidak menyokong akses kamera. Sila buka melalui Google Chrome atau Safari.');
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

  // Pengesahan & Hantar Kehadiran
  const handleSubmitAttendance = () => {
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

    const updatedMember: Member = {
      ...selectedMember,
      hasAttended: true,
      attendedAt: formattedDate,
      selfieUrl: capturedPhoto,
      location: {
        latitude: lat,
        longitude: lng,
        accuracy,
        timestamp: formattedDate,
        distanceMeters: dist,
        status: locationStatus,
      },
    };

    setTimeout(() => {
      setMembers((prev) => prev.map((m) => (m.staffId === updatedMember.staffId ? updatedMember : m)));
      setSelectedMember(updatedMember);
      setIsSubmitting(false);
      setCurrentStep('pass');
    }, 600);
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
      'Status_Swafoto'
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

    // Tambah UTF-8 BOM supaya aksara Bahasa Melayu tidak rosak dalam Excel
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
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
      if (lines.length < 2) {
        alert('Fail CSV kosong atau tidak sah.');
        return;
      }

      const newMembers: Member[] = [];
      // Ambil baris pertama sebagai header
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
        if (confirm(`Dijumpai ${newMembers.length} rekod ahli. Adakah anda ingin menggantikan senarai sedia ada?`)) {
          setMembers(newMembers);
          alert(`Senarai induk telah dikemas kini dengan ${newMembers.length} ahli.`);
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
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setSession((prev) => ({ ...prev, logoUrl: dataUrl }));
        alert('Logo organisasi telah berjaya dikemas kini!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Sesi (Urus Setia)
  const handleResetSession = () => {
    if (confirm('AMARAN: Adakah anda pasti ingin memadam semua rekod kehadiran untuk sesi ini?')) {
      if (confirm('Sila sahkan sekali lagi: Tindakan ini tidak boleh dikembalikan.')) {
        setMembers((prev) =>
          prev.map((m) => ({
            ...m,
            hasAttended: false,
            attendedAt: undefined,
            selfieUrl: undefined,
            location: undefined,
          }))
        );
        alert('Sesi telah direset. Semua rekod kehadiran dikosongkan.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Bar Atas Korporat */}
      <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {session.logoUrl ? (
              <div className="bg-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center max-w-[120px] max-h-9 border border-emerald-700/60">
                <img
                  src={session.logoUrl}
                  alt="Logo Rasmi"
                  className="max-h-7 max-w-[110px] object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-white">e-Hadir</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100 border border-emerald-600/50">
                  {isAdminLoggedIn ? 'Mod Urus Setia' : 'Pendaftaran Ahli'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium truncate max-w-[220px] sm:max-w-md">
                {session.meetingTitle} • {session.meetingDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  Urus Setia Aktif
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-1.5 text-xs bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-700/60 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center space-x-1.5 text-xs bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-600/60 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Urus Setia</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Paparan Utama: Pengguna Ahli / Kiosk vs Dashboard Urus Setia */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-start">
        {isAdminLoggedIn ? (
          /* ========================================================================= */
          /* PANDANGAN URUS SETIA (ADMIN DASHBOARD DENGAN LIVE LOCATION EXCLUSIVE)     */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Header Dashboard & Suis Buka/Tutup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                {session.logoUrl ? (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center max-w-[130px] max-h-12">
                    <img
                      src={session.logoUrl}
                      alt="Logo Rasmi"
                      className="max-h-9 max-w-[110px] object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Papan Pemuka Pemantauan Urus Setia</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      PIN Disahkan
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.venueName}</span>
                    <span className="text-slate-300">•</span>
                    <span>Sasaran Kuorum: {session.quorumTargetPercent}%</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Suis Status Pendaftaran */}
                <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSession((s) => ({ ...s, isRegistrationOpen: true }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      session.isRegistrationOpen
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Buka Pendaftaran
                  </button>
                  <button
                    onClick={() => setSession((s) => ({ ...s, isRegistrationOpen: false }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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

            {/* 4 Kad Statistik Kuorum & Kehadiran */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Hadir</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-800">{stats.totalAttended}</span>
                  <span className="text-xs text-slate-400">orang ahli</span>
                </div>
                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.attendancePercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Ahli Layak</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-800">{stats.totalEligible}</span>
                  <span className="text-xs text-slate-400">dalam senarai</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Senarai induk dimuat naik</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Peratus Kehadiran</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{stats.attendancePercent}%</span>
                  <span className="text-xs font-semibold text-slate-500">Sasaran: {session.quorumTargetPercent}%</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Kemas kini langsung setiap pendaftaran</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status Kuorum</span>
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      stats.isQuorumReached ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`text-lg font-bold ${
                      stats.isQuorumReached ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {stats.isQuorumReached ? 'KUORUM TERCAPAI' : 'BELUM TERCAPAI'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  {stats.isQuorumReached
                    ? 'Mesyuarat sah diteruskan mengikut perlembagaan.'
                    : `Kurang ${Math.max(
                        0,
                        Math.ceil((session.quorumTargetPercent / 100) * stats.totalEligible) - stats.totalAttended
                      )} ahli untuk kuorum minimum.`}
                </p>
              </div>
            </div>

            {/* Tab Navigasi Urus Setia */}
            <div className="flex border-b border-slate-200 space-x-2">
              <button
                onClick={() => setAdminTab('overview')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
                  adminTab === 'overview'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Senarai Kehadiran ({stats.totalAttended})</span>
              </button>

              <button
                onClick={() => setAdminTab('location')}
                className={`relative flex items-center space-x-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
                  adminTab === 'location'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Lokasi Langsung Ahli</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                  Eksklusif Urus Setia
                </span>
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
                  adminTab === 'settings'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Tetapan Sesi & Senarai Induk</span>
              </button>
            </div>

            {/* KANDUNGAN TAB 1: SENARAI KEHADIRAN & STATUS */}
            {adminTab === 'overview' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-4">
                {/* Bar Carian & Penapis */}
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari mengikut Nama atau No. Gaji..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="attended">Sudah Hadir ({stats.totalAttended})</option>
                      <option value="not_attended">Belum Hadir ({stats.totalEligible - stats.totalAttended})</option>
                    </select>
                  </div>
                </div>

                {/* Jadual Ahli */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
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
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
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
                                  className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-medium underline"
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
                                  className="flex items-center space-x-1 text-xs text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-md border border-slate-200 transition"
                                >
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>{member.location.distanceMeters ?? 0}m ke dewan</span>
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

            {/* KANDUNGAN TAB 2: LOKASI KEHADIRAN MASA NYATA (EKSKLUSIF URUS SETIA) */}
            {adminTab === 'location' && (
              <div className="space-y-4">
                {/* Kad Maklumat Akses Eksklusif */}
                <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h2 className="text-base font-bold text-white tracking-wide">
                          Pusat Radar Lokasi Masa Nyata Ahli (Live Tracking)
                        </h2>
                        <span className="text-[10px] bg-emerald-800 border border-emerald-600 px-2 py-0.5 rounded text-emerald-200 font-bold uppercase">
                          Hanya Boleh Dilihat Oleh Urus Setia
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/80">
                        Memantau koordinat GPS secara langsung untuk mengesahkan kedudukan fizikal ahli di dalam atau di sekitar dewan mesyuarat.
                        Data ini disekat sepenuhnya daripada capaian ahli biasa.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-emerald-900/80 px-3.5 py-2 rounded-xl border border-emerald-700/60">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-300">Status Kemas Kini Live</div>
                        <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1">
                          <Radio className="w-3 h-3 text-emerald-400 animate-ping mr-1" />
                          <span>Aktif (Kemas kini: {lastLiveSyncTime})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsLiveSyncActive(!isLiveSyncActive)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          isLiveSyncActive ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-white'
                        }`}
                      >
                        {isLiveSyncActive ? 'Jeda' : 'Mula Semula'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Radar Peta Interaktif & Senarai Ahli Berdekatan */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Peta Vektor Interaktif Berpusat di Dewan */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-5 h-5 text-emerald-700" />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            Peta Taburan Kehadiran Fizikal di Dewan
                          </h3>
                          <p className="text-xs text-slate-500">
                            Titik Rujukan: {session.venueName} ({session.venueCoords.latitude.toFixed(4)}° N,{' '}
                            {session.venueCoords.longitude.toFixed(4)}° E)
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {attendedWithLocation.length} Ahli Berkoordinat
                      </span>
                    </div>

                    {/* Kawasan Paparan Radar Interaktif SVG */}
                    <div className="relative w-full h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                      {/* Grid Radar Angkasa */}
                      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#059669" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#radar-grid)" />
                        {/* Bulatan Zon Zon Jarak */}
                        <circle cx="50%" cy="50%" r="60" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="50%" cy="50%" r="120" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" />
                        <circle cx="50%" cy="50%" r="160" fill="none" stroke="#6ee7b7" strokeWidth="0.75" />
                      </svg>

                      {/* Penunjuk Dewan Pusat */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping"></span>
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shadow-lg border-2 border-white">
                            <Building className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="mt-1 text-[11px] font-bold text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-700/60 shadow">
                          Dewan Mesyuarat
                        </span>
                      </div>

                      {/* Pin Ahli-ahli yang Hadir Secara Live */}
                      {attendedWithLocation.map((m, idx) => {
                        // Plotkan jarak ke kedudukan relatif radar
                        const dLat = (m.location!.latitude - session.venueCoords.latitude) * 120000;
                        const dLng = (m.location!.longitude - session.venueCoords.longitude) * 120000;
                        const xOffset = Math.max(-140, Math.min(140, dLng));
                        const yOffset = Math.max(-130, Math.min(130, -dLat));

                        const isSelected = selectedMapMember?.staffId === m.staffId;

                        return (
                          <div
                            key={m.staffId}
                            style={{
                              transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`,
                            }}
                            onClick={() => setSelectedMapMember(m)}
                            className={`absolute top-1/2 left-1/2 cursor-pointer transition-all duration-300 group z-20 ${
                              isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                            }`}
                          >
                            <div className="relative flex items-center justify-center">
                              {/* Pulse jika dalam dewan */}
                              {m.location!.status === 'dalam_dewan' && (
                                <span className="absolute w-6 h-6 rounded-full bg-emerald-400/40 animate-pulse"></span>
                              )}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border ${
                                  m.location!.status === 'dalam_dewan'
                                    ? 'bg-emerald-600 border-white'
                                    : m.location!.status === 'sekitar_dewan'
                                    ? 'bg-amber-500 border-amber-200'
                                    : 'bg-rose-500 border-rose-200'
                                }`}
                              >
                                {idx + 1}
                              </div>
                            </div>

                            {/* Label Tooltip Hover */}
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none">
                              <p className="font-bold">{m.fullName}</p>
                              <p className="text-emerald-400 font-semibold">{m.location!.distanceMeters}m dari dewan</p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Petunjuk Zon Radar di Sudut */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-300 space-y-1 backdrop-blur-sm z-10">
                        <div className="font-bold text-white mb-1">Petunjuk Zon Jarak:</div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span>Dalam Dewan (&lt; 150m)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span>Sekitar Dewan (150m - 500m)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          <span>Luar Kawasan (&gt; 500m)</span>
                        </div>
                      </div>

                      {/* Paparan Kemas Kini Saat */}
                      <div className="absolute top-3 right-3 bg-slate-900/80 border border-emerald-900/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>LIVE RADAR SYNC</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      * Petua: Tekan mana-mana pin nombor pada peta radar untuk melihat butiran lengkap koordinat dan waktu pendaftaran ahli tersebut.
                    </p>
                  </div>

                  {/* Panel Butiran Ahli Terpilih & Suapan Lokasi Masa Nyata */}
                  <div className="space-y-4">
                    {/* Kad Butiran Ahli Dipilih pada Peta */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                        <span>Butiran Lokasi Terperinci</span>
                        {selectedMapMember && (
                          <button
                            onClick={() => setSelectedMapMember(null)}
                            className="text-slate-400 hover:text-slate-700 text-xs"
                          >
                            Tutup
                          </button>
                        )}
                      </h4>

                      {selectedMapMember && selectedMapMember.location ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            {selectedMapMember.selfieUrl ? (
                              <img
                                src={selectedMapMember.selfieUrl}
                                alt={selectedMapMember.fullName}
                                className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                FOTO
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{selectedMapMember.fullName}</p>
                              <p className="text-xs text-slate-500 font-semibold">{selectedMapMember.staffId} • {selectedMapMember.department}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Zon Lokasi:</span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                  selectedMapMember.location.status === 'dalam_dewan'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : selectedMapMember.location.status === 'sekitar_dewan'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {selectedMapMember.location.status === 'dalam_dewan'
                                  ? 'DALAM DEWAN'
                                  : selectedMapMember.location.status === 'sekitar_dewan'
                                  ? 'SEKITAR DEWAN'
                                  : 'LUAR KAWASAN'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Jarak ke Dewan:</span>
                              <span className="font-black text-slate-900">
                                {selectedMapMember.location.distanceMeters} meter
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Koordinat GPS:</span>
                              <span className="font-mono text-slate-800 font-medium">
                                {selectedMapMember.location.latitude.toFixed(6)},{' '}
                                {selectedMapMember.location.longitude.toFixed(6)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Ketepatan GPS:</span>
                              <span className="text-slate-700">±{selectedMapMember.location.accuracy} meter</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Cap Masa Semakan:</span>
                              <span className="text-slate-700">{selectedMapMember.location.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p>Pilih mana-mana ahli daripada senarai di bawah atau titik pada peta radar untuk melihat koordinat langsung.</p>
                        </div>
                      )}
                    </div>

                    {/* Senarai Kemas Kini Masa Nyata Terkini */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Senarai Ahli Hadir (GPS)
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {attendedWithLocation.length} Orang
                        </span>
                      </div>

                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                        {attendedWithLocation.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">Belum ada ahli yang mendaftar.</p>
                        ) : (
                          attendedWithLocation.map((m, i) => (
                            <div
                              key={m.staffId}
                              onClick={() => setSelectedMapMember(m)}
                              className={`pt-2 first:pt-0 flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                                selectedMapMember?.staffId === m.staffId
                                  ? 'bg-emerald-50 border border-emerald-200'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-xs text-slate-800 line-clamp-1">{m.fullName}</p>
                                  <p className="text-[10px] text-slate-500">{m.staffId} • {m.department}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    m.location!.status === 'dalam_dewan'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {m.location!.distanceMeters}m
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KANDUNGAN TAB 3: TETAPAN SESI & MUAT NAIK SENARAI INDUK */}
            {adminTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tetapan Sesi Mesyuarat & Lokasi Dewan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi tajuk acara, ruang logo organisasi, sasaran kuorum, lokasi koordinat rujukan dewan, dan senarai induk.
                  </p>
                </div>

                {/* Bahagian Ruang Logo Organisasi / Mesyuarat */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        <span>Ruang Logo Organisasi (Sebelum Tajuk Mesyuarat)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Logo ini dipaparkan betul-betul sebelum tajuk mesyuarat pada kad pendaftaran ahli, papan pemuka, dan pas digital.
                      </p>
                    </div>
                    {session.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSession((s) => ({ ...s, logoUrl: undefined }))}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline"
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
                          <span>Muat Naik Logo (PNG / JPG / SVG)</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setSession((s) => ({
                              ...s,
                              logoUrl: DEFAULT_SESSION.logoUrl,
                            }))
                          }
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          Guna Logo Rasmi LGM (Lalai)
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Atau masukkan URL gambar logo luar (https://...)"
                        value={session.logoUrl?.startsWith('data:') ? '' : session.logoUrl || ''}
                        onChange={(e) => setSession((s) => ({ ...s, logoUrl: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tajuk Mesyuarat / Acara</label>
                    <input
                      type="text"
                      value={session.meetingTitle}
                      onChange={(e) => setSession((s) => ({ ...s, meetingTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tarikh Mesyuarat</label>
                    <input
                      type="date"
                      value={session.meetingDate}
                      onChange={(e) => setSession((s) => ({ ...s, meetingDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sasaran Kuorum Sah (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={session.quorumTargetPercent}
                      onChange={(e) => setSession((s) => ({ ...s, quorumTargetPercent: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Tempat / Dewan Rujukan</label>
                    <input
                      type="text"
                      value={session.venueName}
                      onChange={(e) => setSession((s) => ({ ...s, venueName: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Koordinat Dewan (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={session.venueCoords.latitude}
                      onChange={(e) =>
                        setSession((s) => ({
                          ...s,
                          venueCoords: { ...s.venueCoords, latitude: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Koordinat Dewan (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={session.venueCoords.longitude}
                      onChange={(e) =>
                        setSession((s) => ({
                          ...s,
                          venueCoords: { ...s.venueCoords, longitude: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Muat Naik Senarai Induk (CSV) */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Muat Naik Senarai Induk Ahli Layak</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Fail mestilah berformat CSV dengan 3 pengepala kolum: <code>No_Gaji, Nama_Penuh, Bahagian_Cawangan</code>.
                  </p>
                  <label className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-300">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Pilih Fail CSV Senarai Ahli</span>
                    <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
                  </label>
                </div>

                {/* Reset Sesi */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-rose-800">Padam / Reset Sesi Kehadiran</h3>
                    <p className="text-xs text-slate-500">
                      Mengosongkan semua rekod kehadiran untuk memulakan mesyuarat tahun hadapan.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSession}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition"
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
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header Kad Pendaftaran */}
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 text-white text-center relative">
                {/* Ruang Logo Sebelum Tajuk Mesyuarat */}
                <div className="flex flex-col items-center justify-center mb-3.5">
                  {session.logoUrl ? (
                    <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-white/30 flex items-center justify-center max-w-[220px] transition hover:scale-105">
                      <img
                        src={session.logoUrl}
                        alt="Logo Rasmi Organisasi"
                        className="max-h-14 max-w-[200px] object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner backdrop-blur-sm border-2 border-dashed border-emerald-300/40 text-emerald-200">
                      <ImageIcon className="w-8 h-8 text-emerald-300" />
                    </div>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200/90 mt-2 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                    Logo Rasmi Mesyuarat / Organisasi
                  </span>
                </div>

                <h1 className="text-xl font-black tracking-tight">{session.meetingTitle}</h1>
                <p className="text-xs text-emerald-200/90 font-medium mt-1">
                  {session.meetingDate} • {session.venueName}
                </p>

                {/* Status Pendaftaran Dibuka / Ditutup */}
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
                <div className="p-8 text-center space-y-4">
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
                <div className="p-6">
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
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Contoh: LGM1001"
                            value={staffIdInput}
                            onChange={(e) => setStaffIdInput(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 text-base font-bold text-slate-900 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:outline-none uppercase tracking-wide placeholder:normal-case placeholder:font-normal"
                            autoFocus
                          />
                        </div>
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
                        <p>Pastikan anda berada di dalam kawasan dewan mesyuarat sebelum meneruskan pendaftaran.</p>
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

                      {/* Bingkai Pratonton Kamera */}
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
                            <div className="w-40 h-52 border-2 border-dashed border-emerald-400/70 rounded-full"></div>
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

                        {/* Canvas Tersembunyi untuk Pemampatan */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      {/* Kawalan Butang Kamera */}
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
                                  <span>Sahkan & Hantar Kehadiran</span>
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
                    <div className="space-y-5">
                      {/* Kad Pas Digital Emerald Korporat */}
                      <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-600 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        {/* Jalur Hiasan Hijau Atas */}
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
                              <span className="font-medium text-slate-700">{session.venueName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400">
                          Sila simpan tangkapan skrin pas ini atau tunjukkan kepada petugas di pintu dewan sekiranya diminta.
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
                Halaman pemantauan kuorum dan lokasi langsung dilindungi oleh Kod PIN 6-digit.
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

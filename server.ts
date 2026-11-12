import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  logoUrl?: string;
  customQrUrl?: string;
}

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

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'ehadir_state.json');

// Memory state
let currentSession: SessionConfig = { ...DEFAULT_SESSION };
let currentMembers: Member[] = [...INITIAL_MEMBERS];
let lastUpdated = Date.now();

// Load persistent data if exists
function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.session) currentSession = { ...DEFAULT_SESSION, ...parsed.session };
      if (Array.isArray(parsed.members) && parsed.members.length > 0) currentMembers = parsed.members;
      if (parsed.lastUpdated) lastUpdated = parsed.lastUpdated;
      console.log(`[e-Hadir] State loaded from ${DATA_FILE}`);
    }
  } catch (err) {
    console.error('[e-Hadir] Failed to load state, using defaults:', err);
  }
}

function saveState() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    lastUpdated = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify({ session: currentSession, members: currentMembers, lastUpdated }, null, 2));
  } catch (err) {
    console.error('[e-Hadir] Failed to save state to disk:', err);
  }
}

// SSE clients
const sseClients = new Set<express.Response>();

function broadcast(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  loadState();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Support large base64 selfies
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Endpoints
  // 1. Get current full state
  app.get('/api/state', (_req, res) => {
    res.json({
      session: currentSession,
      members: currentMembers,
      lastUpdated,
    });
  });

  // 2. Update session settings
  app.post('/api/session', (req, res) => {
    const updates = req.body;
    currentSession = { ...currentSession, ...updates };
    saveState();
    broadcast('SESSION_UPDATED', { session: currentSession, lastUpdated });
    res.json({ success: true, session: currentSession });
  });

  // 3. Member submits attendance (live selfie + location)
  app.post('/api/attend', (req, res) => {
    const { staffId, selfieUrl, location, attendedAt } = req.body;
    if (!staffId) {
      return res.status(400).json({ error: 'No. Gaji diperlukan' });
    }

    if (!currentSession.isRegistrationOpen) {
      return res.status(403).json({ error: 'Pendaftaran telah ditutup oleh Urus Setia.' });
    }

    const memberIndex = currentMembers.findIndex((m) => m.staffId.toUpperCase() === staffId.trim().toUpperCase());
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'No. Gaji tidak dijumpai dalam senarai ahli layak.' });
    }

    // Check if already attended
    const existing = currentMembers[memberIndex];
    if (existing.hasAttended) {
      return res.json({ success: true, member: existing, alreadyAttended: true });
    }

    const updatedMember: Member = {
      ...existing,
      hasAttended: true,
      attendedAt: attendedAt || new Date().toLocaleString('en-GB'),
      selfieUrl: selfieUrl || existing.selfieUrl,
      location: location || existing.location,
    };

    currentMembers[memberIndex] = updatedMember;
    saveState();
    broadcast('ATTENDANCE_RECORDED', { member: updatedMember, lastUpdated });

    res.json({ success: true, member: updatedMember });
  });

  // 4. Batch import members (from CSV upload)
  app.post('/api/members/import', (req, res) => {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Senarai ahli tidak sah' });
    }
    currentMembers = members.map((m: Partial<Member>) => ({
      staffId: (m.staffId || '').toUpperCase().trim(),
      fullName: (m.fullName || '').trim(),
      department: (m.department || '').trim(),
      hasAttended: Boolean(m.hasAttended),
      attendedAt: m.attendedAt,
      selfieUrl: m.selfieUrl,
      location: m.location,
    }));
    saveState();
    broadcast('MEMBERS_UPDATED', { members: currentMembers, lastUpdated });
    res.json({ success: true, count: currentMembers.length });
  });

  // 5. Reset all attendance for session
  app.post('/api/members/reset', (req, res) => {
    const { pin } = req.body;
    if (pin !== currentSession.adminPin) {
      return res.status(403).json({ error: 'Kod PIN salah' });
    }
    currentMembers = currentMembers.map((m) => ({
      ...m,
      hasAttended: false,
      attendedAt: undefined,
      selfieUrl: undefined,
      location: undefined,
    }));
    saveState();
    broadcast('SESSION_RESET', { members: currentMembers, lastUpdated });
    res.json({ success: true, message: 'Semua rekod kehadiran telah dipadam.' });
  });

  // 6. SSE Stream for Real-time Live Updates across all clients
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial connected state
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ lastUpdated })}\n\n`);

    sseClients.add(res);

    // Keepalive ping every 20 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write(':keepalive\n\n');
      } catch {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[e-Hadir] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[e-Hadir] Failed to start server:', err);
  process.exit(1);
});

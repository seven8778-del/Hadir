/**
 * syncService.ts
 * Real-time synchronization service for e-Hadir.
 * Combines Server-Sent Events (SSE), HTTP API, BroadcastChannel (multi-tab),
 * and localStorage cache for robust multi-device live synchronization.
 */

export interface Member {
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

export interface SessionConfig {
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

export interface SyncState {
  session: SessionConfig;
  members: Member[];
  lastUpdated: number;
}

type SyncListener = (state: SyncState) => void;
type StatusListener = (connected: boolean, lastSyncTime: string) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private lastSyncTime = '';
  private currentState: SyncState | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('ehadir_live_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE' && event.data.state) {
            this.handleStateUpdate(event.data.state);
          }
        };
      } catch (e) {
        console.warn('[SyncService] BroadcastChannel not supported:', e);
      }
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    if (this.currentState) {
      listener(this.currentState);
    }
    return () => this.listeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isConnected, this.lastSyncTime);
    return () => this.statusListeners.delete(listener);
  }

  private notify(state: SyncState) {
    this.currentState = state;
    this.lastSyncTime = new Date().toLocaleTimeString();
    this.listeners.forEach((l) => l(state));
    this.statusListeners.forEach((l) => l(this.isConnected, this.lastSyncTime));

    // Save to local storage for fast instant load
    try {
      localStorage.setItem('ehadir_session', JSON.stringify(state.session));
      localStorage.setItem('ehadir_members', JSON.stringify(state.members));
    } catch {
      // Ignore quota errors
    }

    // Broadcast to other tabs on same device
    this.broadcastChannel?.postMessage({
      type: 'STATE_UPDATE',
      state,
    });
  }

  private handleStateUpdate(state: SyncState) {
    if (!this.currentState || state.lastUpdated >= (this.currentState.lastUpdated || 0)) {
      this.notify(state);
    }
  }

  public async fetchState(): Promise<SyncState | null> {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.ok) {
        const data: SyncState = await res.json();
        this.isConnected = true;
        this.handleStateUpdate(data);
        return data;
      }
    } catch (err) {
      this.isConnected = false;
      this.statusListeners.forEach((l) => l(false, this.lastSyncTime));
    }
    return null;
  }

  public init() {
    // Initial fetch
    this.fetchState();

    // Start SSE
    this.connectSSE();

    // Start backup polling every 4 seconds to guarantee sync even on mobile wake-up
    if (!this.pollTimer) {
      this.pollTimer = setInterval(() => {
        this.fetchState();
      }, 4000);
    }
  }

  private connectSSE() {
    if (typeof window === 'undefined' || !window.EventSource) return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.lastSyncTime = new Date().toLocaleTimeString();
        this.statusListeners.forEach((l) => l(true, this.lastSyncTime));
      };

      this.eventSource.addEventListener('CONNECTED', () => {
        this.isConnected = true;
        this.fetchState();
      });

      this.eventSource.addEventListener('ATTENDANCE_RECORDED', () => {
        this.fetchState();
      });

      this.eventSource.addEventListener('SESSION_UPDATED', () => {
        this.fetchState();
      });

      this.eventSource.addEventListener('MEMBERS_UPDATED', () => {
        this.fetchState();
      });

      this.eventSource.addEventListener('SESSION_RESET', () => {
        this.fetchState();
      });

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.statusListeners.forEach((l) => l(false, this.lastSyncTime));
        // SSE will attempt to reconnect automatically
      };
    } catch (e) {
      console.warn('[SyncService] SSE failed to initialize:', e);
    }
  }

  // API Actions
  public async submitAttendance(data: {
    staffId: string;
    selfieUrl?: string;
    location?: Member['location'];
    attendedAt?: string;
  }) {
    const res = await fetch('/api/attend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menyimpan kehadiran');
    }

    const json = await res.json();
    await this.fetchState();
    return json;
  }

  public async updateSession(sessionUpdates: Partial<SessionConfig>) {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionUpdates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengemas kini sesi');
    }

    const json = await res.json();
    await this.fetchState();
    return json;
  }

  public async importMembers(members: Member[]) {
    const res = await fetch('/api/members/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memuat naik senarai ahli');
    }

    const json = await res.json();
    await this.fetchState();
    return json;
  }

  public async resetSession(adminPin: string) {
    const res = await fetch('/api/members/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: adminPin }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memadam sesi');
    }

    const json = await res.json();
    await this.fetchState();
    return json;
  }

  public destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.listeners.clear();
    this.statusListeners.clear();
  }
}

export const syncService = new SyncService();

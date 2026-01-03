/**
 * WebRTC Signaling Service - GLOBAL ROOM ONLY
 * ONE room for all users - hackathon mode
 */

import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

// WebSocket server URL
const SIGNALING_SERVER_URL = __DEV__
    ? Platform.OS === 'android'
        ? 'http://192.168.1.13:5001'
        : 'http://localhost:5001'
    : 'https://your-production-api.com';

// GLOBAL ROOM - Everyone joins this
const GLOBAL_ROOM_ID = 'HACKATHON_VIDEO_ROOM';

type Role = 'patient' | 'doctor';

class SignalingService {
    private socket: Socket | null = null;

    /**
     * Connect to signaling server
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('🔌 Connecting to signaling server:', SIGNALING_SERVER_URL);

            this.socket = io(SIGNALING_SERVER_URL, {
                transports: ['polling', 'websocket'], // Try polling first, then upgrade
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                forceNew: true,
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('✅ Signaling server connected:', this.socket?.id);
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Signaling connection error:', error.message);
                reject(error);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Signaling server disconnected:', reason);
            });
        });
    }

    /**
     * Join global room
     */
    joinRoom(role: Role) {
        if (!this.socket?.connected) {
            console.error('❌ Cannot join room: Socket not connected');
            return;
        }

        console.log(`🚪 Joining GLOBAL room as ${role}`);

        this.socket.emit('join-room', {
            roomId: GLOBAL_ROOM_ID,
            role,
        });
    }

    /**
     * Send signal (offer/answer/ICE)
     */
    sendSignal(data: any) {
        if (!this.socket?.connected) {
            console.error('❌ Cannot send signal: Not connected');
            return;
        }

        this.socket.emit('signal', {
            roomId: GLOBAL_ROOM_ID,
            ...data,
        });
    }

    /**
     * Listen for signals
     */
    onSignal(callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on('signal', callback);
    }

    /**
     * Remove signal listener
     */
    offSignal() {
        if (!this.socket) return;
        this.socket.off('signal');
    }

    /**
     * Disconnect
     */
    disconnect() {
        if (this.socket) {
            console.log('👋 Disconnecting from signaling server');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

// Singleton
const signalingService = new SignalingService();

export default signalingService;
export type { Role };

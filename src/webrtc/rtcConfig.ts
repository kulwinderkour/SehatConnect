/**
 * WebRTC Configuration - LAN Optimized
 * Configured for local network testing with minimal STUN/TURN requirements
 */

import { RTCConfiguration } from 'react-native-webrtc';

/**
 * LAN-optimized RTC configuration
 * - Single STUN server (Google STUN for candidate gathering)
 * - High ICE candidate pool for faster discovery
 * - No TURN servers (not needed for same network)
 * - Accepts ALL candidate types (host, srflx)
 */
export const rtcConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ],
    iceCandidatePoolSize: 10,
};

/**
 * Media constraints for getUserMedia
 * Optimized for quality and compatibility
 */
export const mediaConstraints = {
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
    },
    video: {
        facingMode: 'user', // Front camera by default
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { min: 15, ideal: 30, max: 30 },
    },
};

/**
 * Offer options for creating SDP offer
 */
export const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
};

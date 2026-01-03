/**
 * useWebRTC Hook - GLOBAL ROOM
 * Simplified pattern: ONE room, auto-start, simple signaling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
    MediaStream,
} from 'react-native-webrtc';
import { rtcConfig } from './rtcConfig';
import signalingService, { Role } from './signalingService';
import { PermissionsAndroid, Platform } from 'react-native';

interface UseWebRTCProps {
    role: Role;
    onError?: (error: string) => void;
}

interface UseWebRTCReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    toggleMute: () => void;
    toggleVideo: () => void;
    switchCamera: () => void;
    endCall: () => void;
    isMuted: boolean;
    isVideoOff: boolean;
    startCall: () => Promise<void>;
}

export const useWebRTC = ({ role, onError }: UseWebRTCProps): UseWebRTCReturn => {
    // Streams
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Media state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // CRITICAL: Single peer connection
    const pcRef = useRef<RTCPeerConnection | null>(null);

    /**
     * Request permissions
     */
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);

                return (
                    granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.error('❌ Permission failed:', err);
                return false;
            }
        }
        return true;
    };

    /**
     * Start call - create PC and get media
     */
    const startCall = useCallback(async () => {
        try {
            console.log('🎬 Starting call as', role);
            setIsConnecting(true);

            // 1. Connect to signaling
            await signalingService.connect();

            // 2. Get permissions
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                throw new Error('Permissions denied');
            }

            // 3. Get media
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            console.log('✅ Got media stream');
            setLocalStream(stream);

            // 4. Create peer connection (ONCE)
            if (!pcRef.current) {
                const pc = new RTCPeerConnection(rtcConfig);
                pcRef.current = pc;

                // Add tracks
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                    console.log(`➕ Added ${track.kind} track`);
                });

                // Handle remote stream
                pc.ontrack = (event: any) => {
                    console.log('📥 Received remote track:', event.track.kind);
                    if (event.streams && event.streams[0]) {
                        setRemoteStream(event.streams[0]);
                    }
                };

                // Handle ICE candidate
                pc.onicecandidate = (event: any) => {
                    if (event.candidate) {
                        console.log('🧊 Sending ICE candidate');
                        signalingService.sendSignal({
                            type: 'ice',
                            payload: event.candidate, // Send directly, NO toJSON()
                        });
                    }
                };

                // Connection state
                pc.onconnectionstatechange = () => {
                    console.log('🔄 Connection state:', pc.connectionState);

                    if (pc.connectionState === 'connected') {
                        setIsConnected(true);
                        setIsConnecting(false);
                        setError(null);
                    } else if (pc.connectionState === 'failed') {
                        setIsConnected(false);
                        setError('Connection failed');
                        onError?.('Connection failed');
                    }
                };
            }

            // 5. Join global room
            signalingService.joinRoom(role);

            // 6. PATIENT creates offer
            if (role === 'patient') {
                console.log('📝 PATIENT creating offer...');
                const offer = await pcRef.current!.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });
                await pcRef.current!.setLocalDescription(offer);

                signalingService.sendSignal({
                    type: 'offer',
                    payload: offer, // Send directly, NO toJSON()
                });
            }
        } catch (err: any) {
            console.error('❌ Start call failed:', err);
            setError(err.message);
            setIsConnecting(false);
            onError?.(err.message);
        }
    }, [role, onError]);

    /**
     * Handle incoming signals
     */
    useEffect(() => {
        const handleSignal = async ({ type, payload }: any) => {
            const pc = pcRef.current;
            if (!pc) {
                console.log('⚠️ Received signal but no PC');
                return;
            }

            try {
                if (type === 'offer') {
                    console.log('📥 Received offer');
                    await pc.setRemoteDescription(new RTCSessionDescription(payload));

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    console.log('📤 Sending answer');
                    signalingService.sendSignal({
                        type: 'answer',
                        payload: answer, // Send directly, NO toJSON()
                    });
                }

                if (type === 'answer') {
                    console.log('📥 Received answer');
                    await pc.setRemoteDescription(new RTCSessionDescription(payload));
                }

                if (type === 'ice') {
                    console.log('📥 Received ICE candidate');
                    await pc.addIceCandidate(new RTCIceCandidate(payload));
                }
            } catch (err) {
                console.error('❌ Handle signal failed:', err);
            }
        };

        signalingService.onSignal(handleSignal);

        return () => {
            signalingService.offSignal();
        };
    }, []);

    /**
     * Toggle mute
     */
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    /**
     * Toggle video
     */
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [localStream]);

    /**
     * Switch camera
     */
    const switchCamera = useCallback(async () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                // @ts-ignore
                videoTrack._switchCamera();
            }
        }
    }, [localStream]);

    /**
     * End call
     */
    const endCall = useCallback(() => {
        console.log('📞 Ending call');

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        signalingService.disconnect();

        setRemoteStream(null);
        setIsConnected(false);
        setIsConnecting(false);
    }, [localStream]);

    return {
        localStream,
        remoteStream,
        isConnected,
        isConnecting,
        error,
        toggleMute,
        toggleVideo,
        switchCamera,
        endCall,
        isMuted,
        isVideoOff,
        startCall,
    };
};

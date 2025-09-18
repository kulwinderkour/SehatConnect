// WebRTC Service
// Handles video call functionality using react-native-webrtc

import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';

// WebRTC configuration
const configuration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
  ],
};

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private error: string | null = null;

  // Event callbacks
  private onLocalStream?: (stream: MediaStream) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onConnectionStateChange?: (state: string) => void;
  private onError?: (error: string) => void;

  // Initialize WebRTC
  async initialize(): Promise<void> {
    try {
      console.log('Initializing WebRTC...');
      this.peerConnection = new RTCPeerConnection(configuration);
      this.setupPeerConnectionListeners();
      console.log('WebRTC initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw new Error('Failed to initialize video call');
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia(): Promise<MediaStream> {
    try {
      console.log('Requesting user media...');
      const stream = await mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 30 },
        },
        audio: true,
      });

      console.log('User media obtained successfully');
      this.localStream = stream;
      this.onLocalStream?.(stream);

      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Failed to access camera and microphone');
    }
  }

  // Start video call
  async startCall(roomId: string): Promise<void> {
    try {
      console.log('Starting video call...');
      this.isConnecting = true;
      this.error = null;

      // Get user media
      await this.getUserMedia();

      // Add local stream to peer connection
      if (this.localStream && this.peerConnection) {
        console.log('Adding tracks to peer connection...');
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      // Create offer
      console.log('Creating offer...');
      const offer = await this.peerConnection?.createOffer();
      await this.peerConnection?.setLocalDescription(offer);

      // In a real app, you would send this offer to your signaling server
      console.log('Offer created:', offer);
      console.log('Video call started successfully');

    } catch (error) {
      console.error('Failed to start call:', error);
      this.error = error instanceof Error ? error.message : 'Failed to start call';
      this.isConnecting = false;
      throw error;
    }
  }

  // Join video call
  async joinCall(roomId: string, offer?: RTCSessionDescription): Promise<void> {
    try {
      this.isConnecting = true;
      this.error = null;

      // Get user media
      await this.getUserMedia();

      // Add local stream to peer connection
      if (this.localStream && this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }

      if (offer) {
        // Set remote description
        await this.peerConnection?.setRemoteDescription(offer);

        // Create answer
        const answer = await this.peerConnection?.createAnswer();
        await this.peerConnection?.setLocalDescription(answer);

        // In a real app, you would send this answer to your signaling server
        console.log('Answer created:', answer);
      }

    } catch (error) {
      console.error('Failed to join call:', error);
      this.error = error instanceof Error ? error.message : 'Failed to join call';
      this.isConnecting = false;
      throw error;
    }
  }

  // End video call
  async endCall(): Promise<void> {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
        });
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.remoteStream = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.error = null;

    } catch (error) {
      console.error('Failed to end call:', error);
      throw error;
    }
  }

  // Toggle camera
  toggleCamera(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle microphone
  toggleMicrophone(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<void> {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          // Get current facing mode
          const currentFacingMode = videoTrack.getSettings().facingMode;
          const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
          
          console.log(`Switching camera from ${currentFacingMode} to ${newFacingMode}`);
          
          // Stop current video track
          videoTrack.stop();
          
          // Get new stream with different camera
          const newStream = await mediaDevices.getUserMedia({
            video: {
              facingMode: newFacingMode,
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              frameRate: { min: 15, ideal: 30, max: 30 },
            },
            audio: true,
          });
          
          // Replace the video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          const sender = this.peerConnection?.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender && newVideoTrack) {
            await sender.replaceTrack(newVideoTrack);
          }
          
          // Update local stream
          this.localStream = newStream;
          this.onLocalStream?.(newStream);
          
          console.log('Camera switched successfully');
        }
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
      throw error;
    }
  }

  // Setup peer connection event listeners
  private setupPeerConnectionListeners(): void {
    if (!this.peerConnection) return;

    // Handle remote stream
    (this.peerConnection as any).ontrack = (event: any) => {
      console.log('Remote stream received');
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(event.streams[0]);
    };

    // Handle connection state changes
    (this.peerConnection as any).onconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.connectionState;
      console.log('Connection state changed:', state);
      
      if (state === 'connected') {
        this.isConnected = true;
        this.isConnecting = false;
      } else if (state === 'disconnected' || state === 'failed') {
        this.isConnected = false;
        this.isConnecting = false;
      }
      
      this.onConnectionStateChange?.(state || 'unknown');
    };

    // Handle ICE candidates
    (this.peerConnection as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        // In a real app, you would send this candidate to your signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle ICE connection state changes
    (this.peerConnection as any).oniceconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.iceConnectionState;
      console.log('ICE connection state:', state);
    };
  }

  // Set event callbacks
  setOnLocalStream(callback: (stream: MediaStream) => void): void {
    this.onLocalStream = callback;
  }

  setOnRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStream = callback;
  }

  setOnConnectionStateChange(callback: (state: string) => void): void {
    this.onConnectionStateChange = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  // Get current state
  getState(): WebRTCState {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      peerConnection: this.peerConnection,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      error: this.error,
    };
  }

  // Cleanup
  cleanup(): void {
    this.endCall();
    this.onLocalStream = undefined;
    this.onRemoteStream = undefined;
    this.onConnectionStateChange = undefined;
    this.onError = undefined;
  }
}

// Create singleton instance
const webRTCService = new WebRTCService();

export default webRTCService;

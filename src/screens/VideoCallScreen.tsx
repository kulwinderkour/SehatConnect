import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Doctor } from '../types/health';
import { ConsultStackParamList } from '../types/navigation';
import { useI18n } from '../i18n';
import permissionService from '../services/PermissionService';
import webRTCService from '../services/WebRTCService';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Video call screen component
export default function VideoCallScreen() {
  const navigation = useNavigation<StackNavigationProp<ConsultStackParamList>>();
  const route = useRoute<RouteProp<ConsultStackParamList, 'VideoCall'>>();
  const { getText } = useI18n();
  
  // Get doctor from navigation params
  const doctor = route.params?.doctor;
  
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<'front' | 'rear'>('front');
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  // Animation for pulsing effect
  const pulseAnim = new Animated.Value(1);

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check permissions first
        const permissions = await permissionService.requestVideoCallPermissions();
        if (!permissions.allGranted) {
          setError('Camera and microphone permissions are required for video calls');
          return;
        }
        
        setPermissionsGranted(true);
        setError(null);
        
      } catch (error) {
        console.error('Failed to check permissions:', error);
        setError('Failed to check permissions');
      }
    };

    checkPermissions();

    // Cleanup on unmount only if call is not active
    return () => {
      if (!isCallActive) {
        webRTCService.cleanup();
      }
    };
  }, [isCallActive]);

  // Cleanup navigation listener on unmount
  useEffect(() => {
    return () => {
      // This will be handled by the navigation listener cleanup
    };
  }, []);

  // Handle navigation away from video call
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, restore call if it was active
      if (isCallActive && !isConnected) {
        // Restore the call state
        setIsConnected(true);
        setCallStatus('connected');
      }
    }, [isCallActive, isConnected])
  );

  // Add navigation listener to prevent accidental navigation away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only show dialog if call is actually active and connected
      if (!isCallActive || !isConnected || callStatus === 'ended') {
        // If call is not active, allow navigation
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Show confirmation dialog
      Alert.alert(
        'End Video Call?',
        'You are in an active video call. Do you want to end the call and leave?',
        [
          {
            text: 'Stay in Call',
            style: 'cancel',
            onPress: () => {
              // Do nothing, stay in the call
            },
          },
          {
            text: 'End Call',
            style: 'destructive',
            onPress: () => {
              // End the call and navigate away
              confirmEndCall();
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isCallActive, isConnected, callStatus, confirmEndCall]);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Reset call state when call ends
  useEffect(() => {
    if (callStatus === 'ended') {
      setIsCallActive(false);
      setIsConnected(false);
    }
  }, [callStatus]);

  // Connection timeout effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isConnecting) {
      timeout = setTimeout(() => {
        setConnectionTimeout(true);
        setIsConnecting(false);
        setError('Connection timeout. Please try again.');
      }, 15000); // 15 second timeout
    }
    return () => clearTimeout(timeout);
  }, [isConnecting]);

  // Pulsing animation for connecting state
  useEffect(() => {
    if (isConnecting) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    }
  }, [isConnecting, pulseAnim]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isConnected && !isUIHidden) {
      const timer = setTimeout(() => {
        setIsUIHidden(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isUIHidden]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock video call for testing
  const startMockCall = useCallback(async () => {
    console.log('Starting mock video call...');
    setIsConnecting(true);
    setCallStatus('connecting');
    setError(null);
    
    try {
      // Initialize WebRTC for demo mode to get real camera access
      await webRTCService.initialize();
      
      // Set up event listeners
      webRTCService.setOnLocalStream((stream) => {
        setLocalStream(stream);
        // Set initial camera state
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const facingMode = videoTrack.getSettings().facingMode;
          setCurrentCamera(facingMode === 'user' ? 'front' : 'rear');
        }
      });
      
      webRTCService.setOnRemoteStream((stream) => {
        setRemoteStream(stream);
      });
      
      webRTCService.setOnConnectionStateChange((state) => {
        if (state === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
          setCallStatus('connected');
        } else if (state === 'disconnected' || state === 'failed') {
          setIsConnected(false);
          setIsConnecting(false);
        }
      });
      
      webRTCService.setOnError((error) => {
        setError(error);
        setIsConnecting(false);
      });
      
      // Get user media for demo mode
      await webRTCService.getUserMedia();
      
      // Set demo mode after getting real camera access
      setMockMode(true);
      setIsVideoOn(true);
      setIsMuted(false);
      setIsConnecting(false);
      setIsConnected(true);
      setCallStatus('connected');
      setIsUIHidden(false);
      setIsCallActive(true);
      
    } catch (error) {
      console.error('Failed to start demo call:', error);
      setError('Failed to access camera for demo mode');
      setIsConnecting(false);
      setCallStatus('connecting');
    }
  }, []);

  // Handle call connection
  const handleConnect = useCallback(async () => {
    if (!permissionsGranted) {
      Alert.alert('Permissions Required', 'Camera and microphone permissions are required for video calls');
      return;
    }

    try {
      setIsConnecting(true);
      setCallStatus('connecting');
      setError(null);
      
      // Initialize WebRTC first
      await webRTCService.initialize();
      
      // Set up event listeners
      webRTCService.setOnLocalStream((stream) => {
        setLocalStream(stream);
      });
      
      webRTCService.setOnRemoteStream((stream) => {
        setRemoteStream(stream);
      });
      
      webRTCService.setOnConnectionStateChange((state) => {
        if (state === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
          setCallStatus('connected');
          setIsUIHidden(false);
          setIsCallActive(true);
        } else if (state === 'disconnected' || state === 'failed') {
          setIsConnected(false);
          setIsConnecting(false);
          setIsCallActive(false);
        }
      });
      
      webRTCService.setOnError((error) => {
        setError(error);
        setIsConnecting(false);
      });
      
      // Start the video call
      await webRTCService.startCall('room-' + Date.now());
      
    } catch (error) {
      console.error('Failed to start call:', error);
      // Show option to try mock mode
      Alert.alert(
        'WebRTC Failed',
        'Real video calling is not available. Would you like to try demo mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Demo Mode', onPress: startMockCall }
        ]
      );
      setError('Failed to start video call');
      setIsConnecting(false);
      setCallStatus('connecting');
    }
  }, [permissionsGranted, startMockCall]);

  // Handle call end
  const handleEndCall = useCallback(() => {
    if (isCallActive) {
      setShowEndCallModal(true);
    } else {
      // If call is not active, just go back
      navigation.goBack();
    }
  }, [isCallActive, navigation]);

  // Confirm end call
  const confirmEndCall = useCallback(() => {
    setCallStatus('ended');
    setShowEndCallModal(false);
    setIsConnected(false);
    setIsCallActive(false);
    webRTCService.cleanup();
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  }, [navigation]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (mockMode) {
      setIsMuted(!isMuted);
    } else {
      const newMuteState = webRTCService.toggleMicrophone();
      setIsMuted(!newMuteState);
    }
  }, [isMuted, mockMode]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (mockMode) {
      setIsVideoOn(!isVideoOn);
      // In demo mode, also toggle the actual camera stream
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !isVideoOn;
        }
      }
    } else {
      const newVideoState = webRTCService.toggleCamera();
      setIsVideoOn(newVideoState);
    }
  }, [isVideoOn, mockMode, localStream]);

  // Switch camera (front/rear)
  const switchCamera = useCallback(async () => {
    try {
      if (localStream) {
        // Get current facing mode
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
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
          
          // Update local stream
          setLocalStream(newStream);
          
          // Update current camera state
          const cameraType = newFacingMode === 'user' ? 'front' : 'rear';
          setCurrentCamera(cameraType);
          
          // Show success message
          Alert.alert('Camera Switch', `Camera switched to ${cameraType} camera`);
          
          console.log('Camera switched successfully');
        }
      } else {
        Alert.alert('Camera Switch', 'No camera stream available');
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
      Alert.alert('Camera Switch Error', 'Failed to switch camera. Please try again.');
    }
  }, [localStream]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setIsUIHidden(!isUIHidden);
  }, [isUIHidden]);

  // Custom button component
  const ControlButton = ({ 
    icon, 
    onPress, 
    isActive = false, 
    isDanger = false,
    size = 'medium'
  }: { 
    icon: string; 
    onPress: () => void; 
    isActive?: boolean; 
    isDanger?: boolean;
    size?: 'small' | 'medium' | 'large';
  }) => {
    const buttonSize = size === 'large' ? 60 : size === 'small' ? 40 : 50;
    
    return (
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: isDanger ? '#ef4444' : isActive ? '#5a9e31' : '#374151',
          }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.controlButtonIcon}>{icon}</Text>
      </TouchableOpacity>
    );
  };

  // Doctor info component
  const DoctorInfo = () => (
    <View style={styles.doctorInfo}>
      <View style={styles.doctorAvatar}>
        <Text style={styles.doctorEmoji}>{doctor.emoji}</Text>
      </View>
      <View style={styles.doctorDetails}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
      </View>
      <View style={styles.callStatus}>
        <Text style={styles.callStatusText}>
          {callStatus === 'connecting' ? 'Connecting...' : 
           callStatus === 'connected' ? 'Connected' : 'Call Ended'}
        </Text>
      </View>
    </View>
  );

  // Call controls component
  const CallControls = () => (
    <View style={styles.callControls}>
      <ControlButton
        icon={isMuted ? '🔇' : '🎤'}
        onPress={toggleMute}
        isActive={!isMuted}
        size="medium"
      />
      <ControlButton
        icon={isVideoOn ? '📹' : '📷'}
        onPress={toggleVideo}
        isActive={isVideoOn}
        size="medium"
      />
      {mockMode && (
        <ControlButton
          icon={currentCamera === 'front' ? '📱' : '📷'}
          onPress={switchCamera}
          isActive={false}
          size="medium"
        />
      )}
      <ControlButton
        icon="📞"
        onPress={handleEndCall}
        isDanger={true}
        size="large"
      />
    </View>
  );

  // Connecting screen
  if (callStatus === 'connecting') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.connectingContainer}>
          <Animated.View style={[styles.connectingAvatar, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.connectingEmoji}>{doctor.emoji}</Text>
          </Animated.View>
          <Text style={styles.connectingTitle}>Connecting to {doctor.name}</Text>
          <Text style={styles.connectingSubtitle}>
            {isConnecting ? 'Establishing connection...' : 
             !permissionsGranted ? 'Requesting permissions...' : 'Ready to connect'}
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {!isConnecting && permissionsGranted && !error && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
                <Text style={styles.connectButtonText}>Start Video Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.demoButton} onPress={startMockCall}>
                <Text style={styles.demoButtonText}>Try Demo Mode</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {(error || connectionTimeout) && (
            <View style={styles.retryContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                setError(null);
                setConnectionTimeout(false);
                handleConnect();
              }}>
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isConnecting && (
            <View style={styles.connectingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Call ended screen
  if (callStatus === 'ended') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.endedContainer}>
          <Text style={styles.endedEmoji}>✅</Text>
          <Text style={styles.endedTitle}>Call Ended</Text>
          <Text style={styles.endedSubtitle}>
            Call duration: {formatDuration(callDuration)}
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Doctors</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main video call screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Video Area */}
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoArea} 
          onPress={toggleControls}
          activeOpacity={1}
        >
          {/* Doctor's video */}
          <View style={styles.doctorVideo}>
            {!mockMode && remoteStream ? (
              <RTCView
                style={styles.rtcView}
                streamURL={remoteStream.toURL()}
                mirror={false}
                objectFit="cover"
              />
            ) : mockMode ? (
              <View style={styles.demoVideoContainer}>
                <View style={styles.demoVideoContent}>
                  <Text style={styles.demoVideoIcon}>👨‍⚕️</Text>
                  <Text style={styles.demoVideoText}>Dr. Rajesh Sharma</Text>
                  <Text style={styles.demoVideoSubtext}>General Medicine</Text>
                  <View style={styles.demoVideoStatus}>
                    <View style={styles.demoStatusDot} />
                    <Text style={styles.demoStatusText}>Online</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.videoPlaceholderContainer}>
                <Text style={styles.videoPlaceholder}>📹</Text>
                <Text style={styles.videoText}>Doctor's Video</Text>
              </View>
            )}
          </View>
          
          {/* Patient's video */}
          <View style={styles.patientVideo}>
            {localStream ? (
              <RTCView
                style={styles.rtcViewSmall}
                streamURL={localStream.toURL()}
                mirror={true}
                objectFit="cover"
              />
            ) : (
              <View style={styles.demoVideoContainerSmall}>
                <View style={styles.demoVideoContentSmall}>
                  <Text style={styles.demoVideoIconSmall}>👤</Text>
                  <Text style={styles.demoVideoTextSmall}>You</Text>
                  <View style={styles.demoVideoStatusSmall}>
                    <View style={[styles.demoStatusDot, { backgroundColor: isVideoOn ? '#5a9e31' : '#ef4444' }]} />
                    <Text style={styles.demoStatusTextSmall}>
                      {isVideoOn ? 'Video On' : 'Video Off'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Top Info Bar */}
      {!isUIHidden && (
        <View style={styles.topInfoBar}>
          <DoctorInfo />
          <View style={styles.callDuration}>
            <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
          </View>
        </View>
      )}

      {/* Call Controls */}
      {!isUIHidden && (
        <View style={styles.controlsContainer}>
          <CallControls />
        </View>
      )}

      {/* Tap to show indicator when UI is hidden */}
      {isUIHidden && (
        <View style={styles.tapIndicator}>
          <Text style={styles.tapIndicatorText}>Tap to show controls</Text>
        </View>
      )}

      {/* End Call Modal */}
      <Modal
        visible={showEndCallModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEndCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Call?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to end this video consultation?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => setShowEndCallModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonEnd}
                onPress={confirmEndCall}
              >
                <Text style={styles.modalButtonEndText}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  connectingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#5a9e31',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  connectingEmoji: {
    fontSize: 48,
  },
  connectingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  connectingSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: '#5a9e31',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  connectingDots: {
    flexDirection: 'row',
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5a9e31',
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  endedEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  endedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  endedSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#5a9e31',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginHorizontal: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  retryContainer: {
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#5a9e31',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  demoButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#5a9e31',
  },
  demoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5a9e31',
    textAlign: 'center',
  },
  videoContainer: {
    flex: 1,
  },
  videoArea: {
    flex: 1,
    position: 'relative',
  },
  doctorVideo: {
    flex: 1,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5a9e31',
  },
  videoPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    fontSize: 32,
    marginBottom: 8,
  },
  videoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  rtcView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  rtcViewSmall: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  demoVideoContainer: {
    flex: 1,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoVideoContent: {
    alignItems: 'center',
    padding: 20,
  },
  demoVideoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  demoVideoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  demoVideoSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  demoVideoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 158, 49, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  demoStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5a9e31',
    marginRight: 8,
  },
  demoStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  demoVideoContainerSmall: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoVideoContentSmall: {
    alignItems: 'center',
    padding: 8,
  },
  demoVideoIconSmall: {
    fontSize: 24,
    marginBottom: 4,
  },
  demoVideoTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  demoVideoStatusSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoStatusTextSmall: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    marginLeft: 4,
  },
  tapIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -10 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tapIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  topInfoBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5a9e31',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorEmoji: {
    fontSize: 20,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#9ca3af',
  },
  doctorHospital: {
    fontSize: 10,
    color: '#6b7280',
  },
  callStatus: {
    marginLeft: 12,
  },
  callStatusText: {
    fontSize: 12,
    color: '#5a9e31',
    fontWeight: '600',
  },
  callDuration: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonIcon: {
    fontSize: 20,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonEnd: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  modalButtonEndText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

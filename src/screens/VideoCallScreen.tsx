/**
 * VideoCallScreen - GLOBAL ROOM
 * Auto-starts call on mount
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft } from 'lucide-react-native';

import { useWebRTC } from '../webrtc/useWebRTC';
import { useAuth } from '../contexts/AuthContext';
import VideoTile from '../components/video/VideoTile';
import CallControls from '../components/video/CallControls';

const VideoCallScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user } = useAuth();

  // Role detection
  const role = user?.role === 'doctor' ? 'doctor' : 'patient';

  // Peer name
  const peerName = role === 'patient' ? 'Dr. Rajesh Sharma' : 'Patient';
  const myName = role === 'patient' ? 'You' : 'Dr. Rajesh Sharma';

  // Initialize WebRTC
  const {
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
  } = useWebRTC({
    role,
    onError: (err) => {
      console.error('WebRTC Error:', err);
      Alert.alert('Connection Error', err, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
  });

  // AUTO-START on mount
  useEffect(() => {
    startCall();
  }, []);

  // Handle end call
  const handleEndCall = () => {
    Alert.alert(
      'End Call?',
      'Are you sure you want to end this video consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            endCall();
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Handle back
  const handleBack = () => {
    if (isConnected) {
      handleEndCall();
    } else {
      endCall();
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Video Consultation</Text>
        <View style={styles.backButton} />
      </View>

      {/* Main Video Area */}
      <View style={styles.videoArea}>
        {/* Remote video (fullscreen) */}
        <VideoTile
          stream={remoteStream}
          name={peerName}
          isLocal={false}
          showWaiting={!remoteStream && !error}
          waitingText={`Waiting for ${peerName} to join...`}
        />

        {/* Local video (PiP) */}
        {localStream && (
          <View style={styles.localVideoPip}>
            <VideoTile
              stream={localStream}
              name={myName}
              isLocal={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />
          </View>
        )}

        {/* Connecting badge */}
        {isConnecting && !error && (
          <View style={styles.connectingBadge}>
            <Text style={styles.connectingText}>Connecting...</Text>
          </View>
        )}

        {/* Error badge */}
        {error && (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onSwitchCamera={switchCamera}
        onEndCall={handleEndCall}
        visible={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  videoArea: {
    flex: 1,
    position: 'relative',
  },
  localVideoPip: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  errorBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default VideoCallScreen;

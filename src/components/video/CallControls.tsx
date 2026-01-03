/**
 * CallControls Component
 * Floating bottom control bar with modern Google Meet-style UI
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Mic, MicOff, Video, VideoOff, RefreshCw, PhoneOff } from 'lucide-react-native';

interface CallControlsProps {
    isMuted: boolean;
    isVideoOff: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onSwitchCamera: () => void;
    onEndCall: () => void;
    visible?: boolean;
}

const CallControls: React.FC<CallControlsProps> = ({
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onSwitchCamera,
    onEndCall,
    visible = true,
}) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.controlBar}>
                {/* Mute/Unmute */}
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        isMuted && styles.controlButtonActive,
                    ]}
                    onPress={onToggleMute}
                    activeOpacity={0.7}
                >
                    {isMuted ? (
                        <MicOff size={24} color="#fff" strokeWidth={2} />
                    ) : (
                        <Mic size={24} color="#fff" strokeWidth={2} />
                    )}
                </TouchableOpacity>

                {/* Video On/Off */}
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        isVideoOff && styles.controlButtonActive,
                    ]}
                    onPress={onToggleVideo}
                    activeOpacity={0.7}
                >
                    {isVideoOff ? (
                        <VideoOff size={24} color="#fff" strokeWidth={2} />
                    ) : (
                        <Video size={24} color="#fff" strokeWidth={2} />
                    )}
                </TouchableOpacity>

                {/* Switch Camera */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onSwitchCamera}
                    activeOpacity={0.7}
                >
                    <RefreshCw size={24} color="#fff" strokeWidth={2} />
                </TouchableOpacity>

                {/* End Call */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={onEndCall}
                    activeOpacity={0.7}
                >
                    <PhoneOff size={28} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    controlBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 40,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    controlButtonActive: {
        backgroundColor: '#ef4444', // Red when active (muted/video off)
    },
    endCallButton: {
        backgroundColor: '#dc2626', // Always red
        width: 64,
        height: 64,
        borderRadius: 32,
    },
});

export default CallControls;

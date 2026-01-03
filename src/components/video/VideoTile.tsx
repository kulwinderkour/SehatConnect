/**
 * VideoTile Component
 * Modern fullscreen video tile for local or remote stream
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { Video, VideoOff, MicOff } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoTileProps {
    stream: MediaStream | null;
    name: string;
    isLocal?: boolean;
    isMuted?: boolean;
    isVideoOff?: boolean;
    showWaiting?: boolean;
    waitingText?: string;
}

const VideoTile: React.FC<VideoTileProps> = ({
    stream,
    name,
    isLocal = false,
    isMuted = false,
    isVideoOff = false,
    showWaiting = false,
    waitingText,
}) => {
    // Render waiting state - CRITICAL: Text wrapped
    if (showWaiting && !stream) {
        return (
            <View style={styles.container}>
                <View style={styles.waitingContainer}>
                    <Video size={64} color="#9ca3af" strokeWidth={1.5} />
                    <Text style={styles.waitingText}>
                        {waitingText || 'Waiting for peer...'}
                    </Text>
                </View>
            </View>
        );
    }

    // Render video off state - CRITICAL: Text wrapped
    if (isVideoOff || !stream) {
        return (
            <View style={styles.container}>
                <View style={styles.videoOffContainer}>
                    <VideoOff size={48} color="#9ca3af" strokeWidth={1.5} />
                    <Text style={styles.videoOffText}>{name}</Text>
                </View>
                {/* Name badge */}
                <View style={styles.nameBadge}>
                    <Text style={styles.nameText}>{name}</Text>
                </View>
                {/* Muted indicator */}
                {isMuted && (
                    <View style={styles.mutedBadge}>
                        <MicOff size={16} color="#fff" strokeWidth={2} />
                    </View>
                )}
            </View>
        );
    }

    // Render video stream
    return (
        <View style={styles.container}>
            {stream && (
                <RTCView
                    streamURL={stream.toURL()}
                    style={styles.rtcView}
                    objectFit="cover"
                    mirror={isLocal} // Mirror local video
                />
            )}

            {/* Name badge - CRITICAL: Text wrapped */}
            <View style={styles.nameBadge}>
                <Text style={styles.nameText}>{name}</Text>
            </View>

            {/* Video off overlay - CRITICAL: Text wrapped */}
            {isVideoOff && (
                <View style={styles.videoOffOverlay}>
                    <VideoOff size={48} color="#fff" strokeWidth={1.5} />
                    <Text style={styles.videoOffOverlayText}>Video Off</Text>
                </View>
            )}

            {/* Muted indicator */}
            {isMuted && (
                <View style={styles.mutedBadge}>
                    <MicOff size={16} color="#fff" strokeWidth={2} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        position: 'relative',
    },
    rtcView: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    // Waiting state
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    waitingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 26,
    },
    // Video off state
    videoOffContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1f2937',
    },
    videoOffText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 16,
    },
    videoOffOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOffOverlayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 12,
    },
    // Name badge
    nameBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    nameText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    // Muted indicator
    mutedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ef4444',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VideoTile;

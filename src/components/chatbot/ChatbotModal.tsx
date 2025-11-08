/**
 * ChatbotModal.tsx
 * Material Design full-screen chatbot modal with proper keyboard handling
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import { useChatbot } from '../../hooks/useChatbot';
import { ChatMessage } from '../../services/ChatbotService';

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

// Medical Chat Bot Icon
const MedicalBotIcon = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
      fill="#1a73e8"
    />
    <Circle cx="9" cy="9" r="1" fill="#1a73e8" />
    <Circle cx="15" cy="9" r="1" fill="#1a73e8" />
  </Svg>
);

// Delete Icon
const DeleteIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
      fill="#5f6368"
    />
  </Svg>
);

// Close Icon
const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill="#5f6368"
    />
  </Svg>
);

// Warning Icon
const WarningIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
      fill="#ea4335"
    />
  </Svg>
);

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onClose }) => {
  const {
    messages,
    isTyping,
    isOnline,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
    checkBackendStatus,
  } = useChatbot();

  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    // Auto-scroll to bottom when new message arrives
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearChat,
        },
      ]
    );
  };

  const handleRetry = () => {
    checkBackendStatus();
    retryLastMessage();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} />
  );

  const renderFooter = () => {
    if (isTyping) {
      return <TypingIndicator />;
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header */}
            <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <MedicalBotIcon size={28} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Sehat AI</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOnline ? '#34a853' : '#ea4335' },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleClearChat}
              >
                <DeleteIcon size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onClose}
              >
                <CloseIcon size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {error && !isOnline && (
            <View style={styles.errorBanner}>
              <View style={styles.errorContent}>
                <WarningIcon size={16} />
                <Text style={styles.errorText}>
                  🔄 Server reconnecting... Please wait or check your connection.
                </Text>
              </View>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />

          {/* Input */}
          <ChatInput 
            onSend={sendMessage} 
            disabled={isTyping}
            placeholder={isTyping ? "Sehat is thinking..." : "Ask anything..."}
          />

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <WarningIcon size={12} />
            <Text style={styles.disclaimerText}>
              AI-powered suggestions. Always consult a doctor for proper diagnosis.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ChatbotModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#5f6368',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: '#fce8e6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  errorText: {
    color: '#c5221f',
    fontSize: 13,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  retryText: {
    color: '#1a73e8',
    fontSize: 13,
    fontWeight: '600',
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 8,
  },
  disclaimer: {
    backgroundColor: '#fef7e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#5f6368',
    flex: 1,
  },
});

/**
 * ChatBubble.tsx
 * Material Design chat message bubbles
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../services/ChatbotService';
import Svg, { Path, Circle } from 'react-native-svg';

interface ChatBubbleProps {
  message: ChatMessage;
}

// Chat Bot Icon
const BotIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
      fill="#1a73e8"
    />
    <Circle cx="9" cy="11" r="1.5" fill="#1a73e8" />
    <Circle cx="15" cy="11" r="1.5" fill="#1a73e8" />
    <Path
      d="M12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z"
      fill="#1a73e8"
    />
  </Svg>
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const showConfidence = message.confidence !== undefined && message.confidence > 0;

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.85) return 'High confidence';
    if (confidence >= 0.65) return 'Medium confidence';
    return 'Low confidence';
  };

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
          <Text style={styles.userTime}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botContainer}>
      <View style={styles.botHeader}>
        <BotIcon />
      </View>
      <View style={styles.botBubble}>
        <Text style={styles.botText}>{message.text}</Text>
        
        {showConfidence && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceText}>
              {getConfidenceLevel(message.confidence!)} · {(message.confidence! * 100).toFixed(0)}%
            </Text>
          </View>
        )}
        
        <Text style={styles.botTime}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userBubble: {
    backgroundColor: '#1a73e8',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '80%',
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  botContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  botHeader: {
    marginRight: 8,
    marginTop: 4,
  },
  botBubble: {
    backgroundColor: '#f1f3f4',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '75%',
  },
  botText: {
    color: '#202124',
    fontSize: 15,
    lineHeight: 20,
  },
  botTime: {
    color: '#5f6368',
    fontSize: 11,
    marginTop: 4,
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceText: {
    color: '#5f6368',
    fontSize: 12,
    fontWeight: '500',
  },
});

/**
 * ChatInput.tsx
 * Material Design chat input component with "Ask Sehat 💬" placeholder
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Send Icon (Paper Plane)
const SendIcon = ({ color = '#ffffff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
      fill={color}
    />
  </Svg>
);

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask anything...',
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          {!hasText && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                <Text style={styles.askSehatBold}>Ask Sehat</Text>
                <Text style={styles.askSehatEmoji}> 💬</Text>
              </Text>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#80868b"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!disabled}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
        </View>

        {hasText && (
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || disabled}
          >
            <SendIcon color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    left: 16,
    top: 10,
    zIndex: 1,
    pointerEvents: 'none',
  },
  placeholderText: {
    fontSize: 15,
  },
  askSehatBold: {
    fontWeight: '700',
    color: '#1a73e8',
    fontSize: 15,
  },
  askSehatEmoji: {
    fontSize: 15,
  },
  input: {
    backgroundColor: '#f1f3f4',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 40,
    maxHeight: 100,
    color: '#202124',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#dadce0',
    shadowOpacity: 0,
    elevation: 0,
  },
});


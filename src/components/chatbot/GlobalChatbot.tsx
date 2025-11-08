/**
 * GlobalChatbot.tsx
 * Global chatbot wrapper that includes floating button and modal
 */

import React from 'react';
import { FloatingChatButton, ChatbotModal } from './index';
import { useChatbotContext } from '../../contexts/ChatbotContext';
import { useAuth } from '../../contexts/AuthContext';

const GlobalChatbot: React.FC = () => {
  const { isChatbotVisible, openChatbot, closeChatbot } = useChatbotContext();
  const { isAuthenticated, user } = useAuth();

  // Only show chatbot for authenticated patients (symptom checker belongs to patients)
  if (!isAuthenticated || (user as any)?.role !== 'patient') {
    return null;
  }

  return (
    <>
      <FloatingChatButton onPress={openChatbot} />
      <ChatbotModal visible={isChatbotVisible} onClose={closeChatbot} />
    </>
  );
};

export default GlobalChatbot;

// no styles required for this wrapper

/**
 * GlobalChatbot.tsx
 * Global chatbot wrapper that includes floating button and modal
 */

import React, { useState, useEffect } from 'react';
import { FloatingChatButton, ChatbotModal } from './index';
import { useChatbotContext } from '../../contexts/ChatbotContext';
import { useAuth } from '../../contexts/AuthContext';
import { navigationRef } from '../../services/NavigationService';

const GlobalChatbot: React.FC = () => {
  const { isChatbotVisible, openChatbot, closeChatbot } = useChatbotContext();
  const { isAuthenticated, user } = useAuth();
  const [isOnVideoCall, setIsOnVideoCall] = useState(false);

  // Listen to navigation state changes to hide on VideoCall screen
  useEffect(() => {
    const checkRoute = () => {
      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();
        setIsOnVideoCall(currentRoute?.name === 'VideoCall');
      }
    };

    // Check immediately
    checkRoute();

    // Listen for navigation state changes
    const unsubscribe = navigationRef.addListener('state', checkRoute);
    return () => unsubscribe();
  }, []);

  // Only show chatbot for authenticated patients (symptom checker belongs to patients)
  // AND hide it on VideoCall screen
  if (!isAuthenticated || (user as any)?.role !== 'patient' || isOnVideoCall) {
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


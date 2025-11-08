/**
 * ChatbotContext.tsx
 * Global context for managing chatbot visibility and state
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isChatbotVisible: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  const openChatbot = () => setIsChatbotVisible(true);
  const closeChatbot = () => setIsChatbotVisible(false);
  const toggleChatbot = () => setIsChatbotVisible(prev => !prev);

  return (
    <ChatbotContext.Provider
      value={{
        isChatbotVisible,
        openChatbot,
        closeChatbot,
        toggleChatbot,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;

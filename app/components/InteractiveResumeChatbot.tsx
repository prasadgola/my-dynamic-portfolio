// app/components/InteractiveResumeChatbot.tsx
'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
// REMOVE THIS LINE: import portfolioData from '../data/portfolioData.json';
import { PortfolioData } from '../data/portfolioData.d'; // KEEP THIS LINE: We still need the type

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

interface InteractiveResumeChatbotProps {
  portfolioData: PortfolioData;
}

// ... rest of your component code remains the same ...
// (e.g., handleSendMessage will continue to use the portfolioData prop)

const InteractiveResumeChatbot: React.FC<InteractiveResumeChatbotProps> = ({ portfolioData }) => {
  // ... rest of the component
};

export default InteractiveResumeChatbot;
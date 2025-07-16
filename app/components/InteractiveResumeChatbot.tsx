// app/components/InteractiveResumeChatbot.tsx
// This component currently serves as a placeholder or is under development.
// Unused imports are removed to satisfy ESLint.
'use client';

import React from 'react'; // Only React is needed for basic component structure
import { PortfolioData } from '../data/portfolioData.d';

interface InteractiveResumeChatbotProps {
  portfolioData: PortfolioData; // This prop is passed but the component body is minimal
}

const InteractiveResumeChatbot: React.FC<InteractiveResumeChatbotProps> = () => {
  // All Chatbot logic and state (useState, useRef, useEffect, FormEvent, ChatMessage, messages, etc.)
  // were likely removed or commented out, leading to 'defined but never used' errors.
  // For now, this component will just display a "Coming Soon" message.

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 text-center">
      <h2 className="text-3xl font-semibold mb-4 text-foreground">Interactive Resume Chatbot</h2>
      <p className="text-lg text-gray-300">
        This feature is under development and will allow you to ask questions about my resume!
      </p>
      {/* You can add a placeholder input or button here if you like */}
      {/* <div className="mt-4">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Send</button>
      </div> */}
    </div>
  );
};

export default InteractiveResumeChatbot;
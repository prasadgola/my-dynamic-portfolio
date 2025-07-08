// app/components/InteractiveResumeChatbot.tsx
'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import portfolioData from '../data/portfolioData.json'; // <--- FIXED: Explicitly use .json extension
import { PortfolioData } from '../data/portfolioData.d'; // <--- NEW: Import the PortfolioData interface

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

interface InteractiveResumeChatbotProps {
  portfolioData: PortfolioData; // <--- FIXED: Use the PortfolioData interface
}

const InteractiveResumeChatbot: React.FC<InteractiveResumeChatbotProps> = ({ portfolioData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial bot message
  useEffect(() => {
    setMessages([
      { type: 'bot', text: "Hello! I'm an AI assistant for Basavaprasad Mallikarjun Gola's portfolio. What would you like to know about them? (e.g., 'What are their main skills?', 'Tell me about their experience', 'Summarize their projects', 'Generate a quick cover letter intro for a React role.')" }
    ]);
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: ChatMessage = { type: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Craft a comprehensive prompt that includes the user's query and relevant portfolio data
      const fullPrompt = `
        You are an AI assistant representing Basavaprasad Mallikarjun Gola's professional portfolio.
        Your goal is to answer questions about their skills, experience, projects, and general professional background based *only* on the provided JSON data.
        If the user asks for a 'cover letter intro' for a specific role/tech, generate a very brief, engaging intro (2-3 sentences) personalized to that role using the portfolio data.
        If the information is not directly available in the provided JSON, politely state that you don't have that specific information.
        Keep your responses concise and professional.

        Here is Basavaprasad Mallikarjun Gola's portfolio data:
        ${JSON.stringify(portfolioData, null, 2)}

        User's question: "${userMessage.text}"
        Your answer:
      `;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const botResponse: ChatMessage = { type: 'bot', text: data.generatedText };
      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error('Error interacting with chatbot LLM:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Oops! I encountered an error. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 flex flex-col h-[500px] md:h-[600px]">
      <h2 className="text-3xl font-semibold mb-4 text-center text-foreground">Interactive Resume</h2>
      <div className="flex-grow overflow-y-auto mb-4 p-2 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-lg max-w-[80%] ${
              msg.type === 'user'
                ? 'bg-blue-600 self-end text-white ml-auto'
                : 'bg-gray-700 self-start text-white mr-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? 'Thinking...' : 'Ask me anything about Basavaprasad...'}
          className="flex-grow p-3 rounded-lg bg-white/20 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default InteractiveResumeChatbot;
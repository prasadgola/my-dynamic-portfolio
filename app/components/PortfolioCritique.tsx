// app/components/PortfolioCritique.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import portfolioData from '../data/portfolioData.json'; // <--- FIXED: Explicitly use .json extension
import { PortfolioData } from '../data/portfolioData.d'; // <--- NEW: Import the PortfolioData interface

interface PortfolioCritiqueProps {
  portfolioData: PortfolioData; // <--- FIXED: Use the PortfolioData interface
}

const PortfolioCritique: React.FC<PortfolioCritiqueProps> = ({ portfolioData }) => {
  const [critique, setCritique] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateCritique = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCritique(''); // Clear previous critique

    try {
      const critiquePrompt = `
        You are an experienced career coach and a portfolio expert.
        Your task is to provide constructive critique and actionable suggestions for a professional portfolio based on the provided JSON data.
        Focus on how to enhance the presentation, clarity, or impact of the personal summary, skills, experience, and project descriptions.
        Suggest areas for improvement or how to rephrase content for better appeal to recruiters.
        Keep the suggestions concise, bullet-pointed, and highly actionable.
        Provide a maximum of 3-5 distinct suggestions.

        Here is the portfolio data for Basavaprasad Mallikarjun Gola:
        ${JSON.stringify(portfolioData, null, 2)}

        Provide your critique and suggestions in a clear, encouraging tone:
      `;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: critiquePrompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCritique(data.generatedText);
    } catch (err) {
      console.error('Error generating portfolio critique:', err);
      setError('Failed to generate critique. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioData]);

  useEffect(() => {
    if (portfolioData && !critique && !isLoading && !error) {
      generateCritique();
    }
  }, [portfolioData, critique, isLoading, error, generateCritique]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
      <h2 className="text-3xl font-semibold mb-4 text-center text-foreground">Self-Critique & Suggestions</h2>
      <div className="min-h-[150px] bg-white/5 p-4 rounded-lg text-foreground/90 leading-relaxed overflow-auto custom-scrollbar">
        {isLoading && <p className="text-center text-blue-300">Generating personalized suggestions...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {critique && !isLoading && (
          <div dangerouslySetInnerHTML={{ __html: critique.replace(/\n/g, '<br>') }} />
        )}
      </div>
      <div className="text-center mt-4">
        <button
          onClick={generateCritique}
          disabled={isLoading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Regenerate Suggestions'}
        </button>
      </div>
    </div>
  );
};

export default PortfolioCritique;
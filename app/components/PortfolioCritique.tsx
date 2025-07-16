// app/components/PortfolioCritique.tsx
'use client';

import React from 'react';
import { PortfolioData } from '../data/portfolioData.d';

interface PortfolioCritiqueProps {
  portfolioData: PortfolioData;
}

const PortfolioCritique: React.FC<PortfolioCritiqueProps> = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 text-center">
      <h2 className="text-3xl font-semibold mb-4 text-foreground">Portfolio Critique</h2>
      <p className="text-lg text-gray-300">
        This feature is under development and will provide AI-powered feedback on your portfolio!
      </p>
    </div>
  );
};

export default PortfolioCritique;
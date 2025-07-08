// app/components/DynamicBackground.tsx
'use client'; // This component will run on the client side because of state and random number generation

import React, { useEffect, useState } from 'react';

// Define a list of possible background classes
const backgroundClasses = [
  'bg-gradient-to-br from-blue-400 to-purple-600',
  'bg-gradient-to-br from-green-400 to-teal-600',
  'bg-gradient-to-br from-red-400 to-pink-600',
  'bg-gradient-to-br from-yellow-400 to-orange-600',
  'bg-gradient-to-br from-indigo-400 to-purple-400',
  'bg-zinc-900', // A solid dark background option
  'bg-neutral-800', // Another solid dark background
];

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const [currentBackground, setCurrentBackground] = useState('');

  useEffect(() => {
    // Select a random background class on component mount (which happens on page refresh)
    const randomIndex = Math.floor(Math.random() * backgroundClasses.length);
    setCurrentBackground(backgroundClasses[randomIndex]);
  }, []); // Empty dependency array ensures this runs only once per mount/refresh

  return (
    <div className={`min-h-screen transition-colors duration-1000 ease-in-out ${currentBackground}`}>
      {children}
    </div>
  );
};

export default DynamicBackground;
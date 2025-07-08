// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DynamicBackground from './components/DynamicBackground'; // Import your new component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Your Dynamic Portfolio',
  description: 'A portfolio with dynamic UI powered by LLMs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicBackground> {/* Wrap your children with DynamicBackground */}
          {children}
        </DynamicBackground>
      </body>
    </html>
  );
}
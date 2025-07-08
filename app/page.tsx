// app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import portfolioData from '../data/portfolioData';
import InteractiveResumeChatbot from './components/InteractiveResumeChatbot';
import PortfolioCritique from './components/PortfolioCritique';
import Image from 'next/image'; // <--- NEW IMPORT: Import the Image component

// Define different layout "themes" using Tailwind CSS classes
const layoutThemes = [
  { id: 'wide-padding', container: 'max-w-7xl mx-auto px-4 md:px-8 py-16', text: 'text-lg' },
  { id: 'narrow-padding', container: 'max-w-5xl mx-auto px-2 md:px-6 py-12', text: 'text-base' },
  { id: 'spacious', container: 'max-w-6xl mx-auto px-6 md:px-12 py-20', text: 'text-xl' },
  { id: 'compact', container: 'max-w-4xl mx-auto px-4 md:px-8 py-10', text: 'text-md' },
];

// Type definition for a Project, useful for TypeScript
interface Project {
  id: string;
  name: string;
  technologies: string[];
  shortDescription: string;
  longDescription: string;
  githubLink: string | null;
  liveLink: string | null;
}

export default function Home() {
  const [currentLayout, setCurrentLayout] = useState('');
  const [currentTextSize, setCurrentTextSize] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [llmProjectDescriptions, setLlmProjectDescriptions] = useState<Record<string, string>>({});
  const [loadingProjectDescription, setLoadingProjectDescription] = useState<string | null>(null);

  // --- Layout & Background Logic (Existing) ---
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * layoutThemes.length);
    const selectedTheme = layoutThemes[randomIndex];
    setCurrentLayout(selectedTheme.container);
    setCurrentTextSize(selectedTheme.text);
  }, []);

  // --- LLM Description Fetching Logic (Existing) ---
  const fetchLlmDescription = useCallback(async (project: Project) => {
    if (llmProjectDescriptions[project.id]) {
      return llmProjectDescriptions[project.id];
    }

    setLoadingProjectDescription(project.id);
    try {
      const prompt = `Generate a compelling and slightly expanded description for the project "${project.name}". Focus on its purpose, the key technologies used (${project.technologies.join(', ')}), and a summary of its main features or impact. Keep it concise, around 100-150 words, and engaging for a portfolio viewer. Here's a starting point: "${project.longDescription}"`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const generatedText = data.generatedText;

      setLlmProjectDescriptions((prev) => ({
        ...prev,
        [project.id]: generatedText,
      }));
      return generatedText;
    } catch (error) {
      console.error(`Error fetching LLM description for ${project.name}:`, error);
      return project.longDescription;
    } finally {
      setLoadingProjectDescription(null);
    }
  }, [llmProjectDescriptions]);

  // --- Pre-fetching LLM Descriptions on Load (Existing) ---
  useEffect(() => {
    if (Object.keys(llmProjectDescriptions).length === 0 && portfolioData.projects.length > 0) {
      portfolioData.projects.forEach(project => {
        fetchLlmDescription(project);
      });
    }
  }, [fetchLlmDescription, llmProjectDescriptions]);

  // --- Click Handler for Projects (Existing) ---
  const handleProjectClick = useCallback((project: Project) => {
    setExpandedProjectId(prevId => (prevId === project.id ? null : project.id));
  }, []);

  const getProjectDescription = (project: Project) => {
    if (loadingProjectDescription === project.id) {
      return 'Generating dynamic description...';
    }
    return llmProjectDescriptions[project.id] || project.longDescription;
  };

  return (
    <div className={`relative z-10 ${currentLayout} ${currentTextSize} text-foreground`}>
      <header className="mb-12 text-center">
        {/* --- Add your Image here --- */}
        <div className="mb-6 flex justify-center"> {/* Centering container for image */}
          <Image
            src="/images/Ba.png" // <--- IMPORTANT: Update this path to your image!
            alt="Basavaprasad Mallikarjun Gola" // Alt text for accessibility
            width={160} // Set your desired width (e.g., 160px)
            height={160} // Set your desired height (e.g., 160px)
            className="rounded-full border-4 border-purple-500 shadow-lg" // Tailwind for round image, border, shadow
            priority // Prioritize loading for LCP (Largest Contentful Paint)
          />
        </div>
        {/* --- End Image --- */}

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          {portfolioData.personalInfo.name}
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80">
          {portfolioData.personalInfo.title}
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">About Me</h2>
        <p className="leading-relaxed text-foreground/90">
          {portfolioData.personalInfo.bioSummary}
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioData.skills.map((skillCategory, index) => (
            <div key={index} className="bg-white/5 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-medium mb-3">{skillCategory.category}</h3>
              <ul className="list-disc list-inside pl-4">
                {skillCategory.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portfolioData.projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/5 p-8 rounded-lg shadow-inner flex flex-col cursor-pointer transition-transform transform hover:scale-[1.02]"
              onClick={() => handleProjectClick(project)}
            >
              <h3 className="text-2xl font-semibold mb-3">{project.name}</h3>
              {expandedProjectId === project.id ? (
                <p className="text-foreground/80 mb-4 flex-grow">
                  {getProjectDescription(project)}
                </p>
              ) : (
                <p className="text-foreground/80 mb-4 flex-grow">
                  {project.shortDescription}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="bg-purple-600/20 text-purple-200 text-sm px-3 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex gap-4">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    GitHub
                  </a>
                )}
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <InteractiveResumeChatbot portfolioData={portfolioData} />
      </section>

      <section className="mb-16">
        <PortfolioCritique portfolioData={portfolioData} />
      </section>

      <footer className="text-center mt-16 text-foreground/70">
        <p>&copy; {new Date().getFullYear()} {portfolioData.personalInfo.name}. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
            {portfolioData.personalInfo.contact.email && (
                <a href={`mailto:${portfolioData.personalInfo.contact.email}`} className="hover:underline">Email</a>
            )}
            {portfolioData.personalInfo.contact.linkedin && (
                <a href={portfolioData.personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
            )}
            {portfolioData.personalInfo.contact.github && (
                <a href={portfolioData.personalInfo.contact.github} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
            )}
        </div>
      </footer>
    </div>
  );
}
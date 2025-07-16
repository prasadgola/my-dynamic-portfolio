// app/page.tsx
'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react'; // <-- IMPORT useCallback
import PortfolioCritique from './components/PortfolioCritique';
import InteractiveResumeChatbot from './components/InteractiveResumeChatbot';
import portfolioData from './data/portfolioData.json';
import { PortfolioData, Project, SkillItem, ExperienceItem, EducationItem, TestimonialItem } from './data/portfolioData.d';
import DynamicProjectCard from './components/DynamicProjectCard';

interface DynamicSummaryState {
  text: string;
  isLoading: boolean;
  error: string | null;
}

interface DynamicBackgroundState {
  style: string; // Will store the CSS gradient string
  isLoading: boolean;
  error: string | null;
}

export default function Home() {
  const [activeLayout, setActiveLayout] = useState('full');

  const [dynamicAboutMe, setDynamicAboutMe] = useState<DynamicSummaryState>({
    text: '',
    isLoading: true,
    error: null,
  });

  const [dynamicBackground, setDynamicBackground] = useState<DynamicBackgroundState>({
    style: 'linear-gradient(to right, #1a202c, #2d3748)', // Default dark gradient
    isLoading: true,
    error: null,
  });

  // Wrap fetchDynamicAboutMe in useCallback
  const fetchDynamicAboutMe = useCallback(async () => { // <-- WRAP IN useCallback
    setDynamicAboutMe({ text: '', isLoading: true, error: null });
    
    const aboutMePromptVariations = [
      "Generate a concise, professional summary for a software engineer based on the following portfolio data. Highlight key strengths and career focus.",
      "Draft an engaging 'About Me' section from the perspective of a proactive software engineer using this portfolio data. Focus on impact and passion for technology.",
      "Create a brief, compelling introduction for a developer based on their skills and experience below, suitable for an 'About Me' section, emphasizing their unique value proposition."
    ];
    
    const selectedPrompt = aboutMePromptVariations[Math.floor(Math.random() * aboutMePromptVariations.length)];

    try {
      const promptContent = `
        Based on the following JSON portfolio data for ${portfolioData.personalInfo.name}, ${selectedPrompt}

        Portfolio Data:
        Name: ${portfolioData.personalInfo.name}
        Title: ${portfolioData.personalInfo.title}
        Bio Summary: ${portfolioData.personalInfo.bioSummary}
        Skills: ${portfolioData.skills.map(s => s.items.join(', ')).join('; ')}
        Experience: ${portfolioData.experience.map(e => `${e.title} at ${e.company} (${e.duration})`).join('; ')}
      `;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptContent }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setDynamicAboutMe({ text: data.generatedText, isLoading: false, error: null });
    } catch (err: unknown) {
      console.error('Error fetching dynamic about me:', err);
      setDynamicAboutMe({ text: '', isLoading: false, error: 'Failed to load dynamic summary. Please try again.' });
    }
  }, []);

  // Wrap fetchDynamicBackground in useCallback
  const fetchDynamicBackground = useCallback(async () => { // <-- WRAP IN useCallback
    setDynamicBackground({ style: 'linear-gradient(to right, #1a202c, #2d3748)', isLoading: true, error: null });
    
    const backgroundPromptVariations = [
      "Generate a CSS linear-gradient background that evokes a sense of modern technology and innovation. Use dark, subtle, or futuristic colors. Provide only the CSS value (e.g., 'linear-gradient(to right, #1a202c, #2d3748)').",
      "Create a visually appealing and abstract CSS linear-gradient. Focus on professional yet dynamic colors. Provide only the CSS value.",
      "Suggest a gentle, flowing CSS linear-gradient suitable for a creative tech portfolio. Use complementary muted tones. Provide only the CSS value."
    ];
    
    const selectedPrompt = backgroundPromptVariations[Math.floor(Math.random() * backgroundPromptVariations.length)];

    try {
      const promptContent = `
        ${selectedPrompt}
        Ensure the output is ONLY the CSS gradient value, nothing else.
      `;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptContent }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      let generatedStyle = data.generatedText.trim();

      if (generatedStyle.startsWith('```css')) {
        generatedStyle = generatedStyle.substring(6);
      }
      if (generatedStyle.endsWith('```')) {
        generatedStyle = generatedStyle.substring(0, generatedStyle.length - 3);
      }
      generatedStyle = generatedStyle.trim();


      if (generatedStyle.startsWith('linear-gradient(') || generatedStyle.startsWith('radial-gradient(')) {
        setDynamicBackground({ style: generatedStyle, isLoading: false, error: null });
      } else {
        console.warn('LLM generated non-CSS gradient:', generatedStyle);
        setDynamicBackground({ style: 'linear-gradient(to right, #1a202c, #2d3748)', isLoading: false, error: 'Invalid gradient generated. Using default.' });
      }

    } catch (err: unknown) {
      console.error('Error fetching dynamic background:', err);
      setDynamicBackground({ style: 'linear-gradient(to right, #1a202c, #2d3748)', isLoading: false, error: 'Failed to load dynamic background. Using default.' });
    }
  }, []);


  useEffect(() => {
    fetchDynamicAboutMe();
    fetchDynamicBackground();
  }, [fetchDynamicAboutMe, fetchDynamicBackground]); // <-- FIX: Include both functions as dependencies

  const layoutThemes = [
    { id: 'full', name: 'Full Portfolio' },
    { id: 'dynamic-llm', name: 'Dynamic LLM (Coming Soon)' }
  ];

  return (
    <div
      className="min-h-screen text-white font-sans transition-all duration-1000 ease-in-out"
      style={{ background: dynamicBackground.style }}
    >
      <header className="py-6 px-4 md:px-8 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          {portfolioData.personalInfo.name}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6 text-center max-w-2xl">
          {portfolioData.personalInfo.title}
        </p>

        <div className="flex space-x-4 mb-8">
          {layoutThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setActiveLayout(theme.id)}
              className={`px-5 py-2 rounded-full text-lg font-medium transition-all duration-300
                ${activeLayout === theme.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={fetchDynamicBackground}
            disabled={dynamicBackground.isLoading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {dynamicBackground.isLoading ? 'Generating Background...' : 'Regenerate Background'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-12">
        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-4 text-center text-foreground">About Me (Dynamic)</h2>
          <div className="text-lg text-gray-300 leading-relaxed text-center">
            {dynamicAboutMe.isLoading && <p>Generating your dynamic summary...</p>}
            {dynamicAboutMe.error && <p className="text-red-400">{dynamicAboutMe.error}</p>}
            {dynamicAboutMe.text && <p>{dynamicAboutMe.text}</p>}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={fetchDynamicAboutMe}
              disabled={dynamicAboutMe.isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {dynamicAboutMe.isLoading ? 'Generating...' : 'Regenerate About Me'}
            </button>
          </div>
        </section>

        <section className="flex justify-center items-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg">
            <Image
              src="/images/Ba.png"
              alt="Basavaprasad Mallikarjun Gola Profile Picture"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="rounded-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-6 text-center text-foreground">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.skills.map((category: SkillItem, index: number) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-green-400 mb-2">{category.category}</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {category.items.map((skill: string, skillIndex: number) => (
                    <li key={skillIndex}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-6 text-center text-foreground">Experience</h2>
          <div className="space-y-8">
            {portfolioData.experience.map((exp: ExperienceItem, index: number) => (
              <div key={index} className="bg-white/5 p-5 rounded-lg">
                <h3 className="text-2xl font-semibold text-purple-400">{exp.title}</h3>
                <p className="text-lg text-gray-300">{exp.company} | {exp.duration}</p>
                <ul className="mt-2 text-gray-400 leading-relaxed list-disc list-inside">
                  {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                  ))}
                </ul>
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-gray-300">Achievements:</p>
                    <ul className="list-disc list-inside text-gray-400">
                      {exp.achievements.map((ach, idx) => (
                        <li key={idx}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-6 text-center text-foreground">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioData.projects.map((project: Project) => (
              <DynamicProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-6 text-center text-foreground">Education</h2>
          <div className="space-y-6">
            {portfolioData.education.map((edu: EducationItem, index: number) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-400">{edu.degree}</h3>
                <p className="text-lg text-gray-300">{edu.university} | {edu.duration}</p>
                <p className="mt-1 text-gray-400">{edu.details}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold mb-6 text-center text-foreground">Testimonials</h2>
          <div className="space-y-6">
            {portfolioData.testimonials.map((test: TestimonialItem, index: number) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg italic text-center">
                {/* FIX: Escaped quotes */}
                <p className="text-lg text-gray-300 mb-2">&quot;{test.quote}&quot;</p>
                <p className="text-sm text-gray-400">- {test.author}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Contact Me</h2>
          <p className="text-lg text-gray-300 mb-2">Email: {portfolioData.personalInfo.contact.email}</p>
          <div className="flex justify-center gap-4">
            <a href={portfolioData.personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-lg">LinkedIn</a>
            <a href={portfolioData.personalInfo.contact.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline text-lg">GitHub</a>
            {portfolioData.personalInfo.contact.website && (
              <a href={portfolioData.personalInfo.contact.website} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-lg">Website</a>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <PortfolioCritique portfolioData={portfolioData as PortfolioData} />
          <InteractiveResumeChatbot portfolioData={portfolioData as PortfolioData} />
        </section>
      </main>

      <footer className="py-6 px-4 md:px-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} {portfolioData.personalInfo.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
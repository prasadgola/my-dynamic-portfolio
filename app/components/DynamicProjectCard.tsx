// app/components/DynamicProjectCard.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // <-- IMPORT useCallback
import { Project } from '../data/portfolioData.d';

interface DynamicProjectCardProps {
  project: Project;
}

const ProjectShortDescriptionVariations = [
  "Create a concise, engaging summary (max 3 sentences) focusing on its primary achievement.",
  "Generate a punchy, brief overview (max 2 sentences) highlighting key technologies and impact.",
  "Provide a short, impactful description for a project card, focusing on what it solves.",
  "Write a one-sentence elevator pitch for this project, suitable for a portfolio card.",
  "Summarize the project's essence in 2 sentences, emphasizing its core functionality and benefits."
];

const DynamicProjectCard: React.FC<DynamicProjectCardProps> = ({ project }) => {
  const [dynamicShortDescription, setDynamicShortDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Wrap fetchDynamicShortDescription in useCallback
  const fetchDynamicShortDescription = useCallback(async () => { // <-- WRAP IN useCallback
    setIsLoading(true);
    setError(null);
    setDynamicShortDescription('');

    // Ensure project is defined before proceeding, though useEffect now handles this
    if (!project) {
        setIsLoading(false);
        setError('Project data not available.');
        return;
    }

    const selectedPromptInstruction = ProjectShortDescriptionVariations[Math.floor(Math.random() * ProjectShortDescriptionVariations.length)];
    // console.log(`[${project.name}] - Selected Short Description Prompt:`, selectedPromptInstruction);

    try {
      const promptContent = `
        Based on the following project details for "${project.name}":
        Original Long Description: "${project.longDescription}"
        Technologies used: ${project.technologies.join(', ')}

        Task: ${selectedPromptInstruction}
        Provide only the rephrased short description, without any additional commentary, introduction, or conclusion.
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
      // console.log(`[${project.name}] - Generated Short Description:`, data.generatedText);
      setDynamicShortDescription(data.generatedText);
    } catch (err: any) { // <-- FIX: Explicitly type 'error' as 'any'
      console.error(`Error fetching dynamic short description for ${project.name}:`, err);
      setError('Failed to load project description.');
    } finally {
      setIsLoading(false);
    }
  }, [project]); // <-- DEPENDENCY: project object itself. When project changes, the callback will update.


  // Effect to fetch description on component mount or if project data changes
  useEffect(() => {
    if (project) {
      fetchDynamicShortDescription();
    }
  }, [project, fetchDynamicShortDescription]); // <-- FIX: Include fetchDynamicShortDescription and project

  return (
    <div
      className="bg-white/5 p-6 rounded-lg shadow-xl flex flex-col justify-between"
    >
      <div>
        <h3 className="text-2xl font-semibold text-blue-400 mb-2">{project?.name}</h3>
        {isLoading ? (
          <p className="text-gray-400 mb-4 animate-pulse min-h-16 flex items-center justify-center">Loading description...</p>
        ) : error ? (
          <p className="text-red-400 mb-4 min-h-16 flex items-center justify-center">{error}</p>
        ) : (
          <p className="text-gray-400 mb-4 line-clamp-3 min-h-16">{dynamicShortDescription || project?.shortDescription}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {project?.technologies?.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="bg-gray-600 text-gray-200 text-sm px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicProjectCard;
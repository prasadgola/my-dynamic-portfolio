// app/components/DynamicProjectCard.tsx
'use client'; // This directive is crucial for client-side components in Next.js App Router

import React, { useState, useEffect } from 'react';
import { Project } from '../data/portfolioData.d'; // Ensure this path is correct

interface DynamicProjectCardProps {
  project: Project; // Expects a Project object
}

const ProjectShortDescriptionVariations = [
  "Create a concise, engaging summary (max 3 sentences) focusing on its primary achievement.",
  "Generate a punchy, brief overview (max 2 sentences) highlighting key technologies and impact.",
  "Provide a short, impactful description for a project card, focusing on what it solves.",
  "Write a one-sentence elevator pitch for this project, suitable for a portfolio card.",
  "Summarize the project's essence in 2 sentences, emphasizing its core functionality and benefits."
];

const DynamicProjectCard: React.FC<DynamicProjectCardProps> = ({ project }) => {
  // Debug log: You can uncomment this temporarily if you need to check the 'project' prop
  // console.log("DynamicProjectCard received project:", project); 

  const [dynamicShortDescription, setDynamicShortDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDynamicShortDescription = async () => {
    setIsLoading(true);
    setError(null);
    setDynamicShortDescription(''); // Clear previous description

    // Select a random prompt variation
    const selectedPromptInstruction = ProjectShortDescriptionVariations[Math.floor(Math.random() * ProjectShortDescriptionVariations.length)];
    // console.log(`[${project?.name}] - Selected Short Description Prompt:`, selectedPromptInstruction); // Debug log

    try {
      // Construct the prompt for the Gemini API
      const promptContent = `
        Based on the following project details for "${project?.name}":
        Original Long Description: "${project?.longDescription}"
        Technologies used: ${project?.technologies?.join(', ')}

        Task: ${selectedPromptInstruction}
        Provide only the rephrased short description, without any additional commentary, introduction, or conclusion.
      `;

      // Make the API call to your Next.js API route
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptContent }),
      });

      // Handle non-OK responses from the API
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Parse the JSON response
      const data = await res.json();
      // console.log(`[${project?.name}] - Generated Short Description:`, data.generatedText); // Debug log
      setDynamicShortDescription(data.generatedText); // Update state with generated text
    } catch (err: any) {
      console.error(`Error fetching dynamic short description for ${project?.name}:`, err);
      setError('Failed to load project description.'); // Set error message
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  // useEffect hook to fetch the description when the component mounts
  // or when relevant project properties change.
  // Added optional chaining (?.) to dependencies to safely access properties
  // and a check 'if (project)' to ensure 'project' is not undefined before fetching.
  useEffect(() => {
    if (project) { // Ensure project object exists before making the API call
      fetchDynamicShortDescription();
    }
  }, [project?.id, project?.name, project?.longDescription, project?.technologies]);

  // Main component rendering
  return (
    <div // This is the start of the JSX return. This is line 75 in your error.
      className="bg-white/5 p-6 rounded-lg shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Display project name, safely accessed with optional chaining */}
        <h3 className="text-2xl font-semibold text-blue-400 mb-2">{project?.name}</h3>
        {/* Conditional rendering for loading, error, or dynamic description */}
        {isLoading ? (
          <p className="text-gray-400 mb-4 animate-pulse min-h-16 flex items-center justify-center">Loading description...</p>
        ) : error ? (
          <p className="text-red-400 mb-4 min-h-16 flex items-center justify-center">{error}</p>
        ) : (
          // Display dynamic description, fallback to original if dynamic is empty
          <p className="text-gray-400 mb-4 line-clamp-3 min-h-16">{dynamicShortDescription || project?.shortDescription}</p>
        )}
        {/* Display project technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Safely map over technologies with optional chaining */}
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
      {/* Removed the "Regenerate Short Description" button */}
    </div>
  );
};

export default DynamicProjectCard; // This line exports the component for use in other files
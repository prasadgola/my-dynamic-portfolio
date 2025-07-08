// app/data/portfolioData.d.ts

// Define the structure for individual skill objects
interface Skill {
  name: string;
  level: string; // e.g., "Expert", "Advanced", "Intermediate"
}

// Define the structure for individual experience objects
interface Experience {
  title: string;
  company: string;
  years: string; // e.g., "2022-Present", "2018-2021"
  description: string;
}

// Define the structure for individual project objects
interface Project {
  name: string;
  description: string;
  technologies: string[]; // e.g., ["React", "Node.js", "MongoDB"]
}

// Define the structure for the contact information
interface Contact {
  email: string;
  linkedin: string;
  github: string;
  // Add other contact fields if present in your JSON
}

// Define the main interface for the entire portfolio data object
export interface PortfolioData {
  personalSummary: string;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  contact: Contact;
  // Add any other top-level fields from your portfolioData.json here
  [key: string]: any; // This allows for extra properties not explicitly defined above, if needed.
                     // Try to be as specific as possible first.
}

// This declaration tells TypeScript that when you import 'portfolioData.json',
// its default export will conform to the PortfolioData interface.
declare module '../data/portfolioData.json' {
  const content: PortfolioData;
  export default content;
}
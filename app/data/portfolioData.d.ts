// app/data/portfolioData.d.ts

export interface PersonalInfo {
  name: string;
  title: string;
  bioSummary: string;
  contact: {
    email: string;
    linkedin: string;
    github: string;
    website?: string;
  };
}

export interface SkillItem {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  shortDescription: string;
  longDescription: string;
  githubLink?: string;
  liveLink?: string | null;
}

export interface EducationItem {
  degree: string;
  university: string;
  duration: string;
  details: string;
}

export interface TestimonialItem {
  author: string;
  quote: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: Project[];
  education: EducationItem[];
  testimonials: TestimonialItem[];
}

declare module './portfolioData.json' {
  const content: PortfolioData;
  export default content;
}
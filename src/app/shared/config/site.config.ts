/**
 * Site Configuration
 * Centralized configuration for the entire application
 * 
 * Edit this file to update site-wide settings
 */

export interface SiteConfig {
  // Site Information
  site: {
    name: string;
    tagline: string;
    description: string;
    url: string;
  };
  
  // Author/Blog Owner Information
  author: {
    name: string;
    bio: string;
    location: string;
    email: string;
  };
  
  // Copyright Information
  copyright: {
    year: number;
    holder: string;
  };
  
  // Social Media Links
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  
  // Public Google Drive Links
  publicLinks: {
    enabled: boolean;
    links: Array<{
      title: string;
      url: string;
    }>;
  };
  
  // Feature Flags
  features: {
    showDevelopmentBanner: boolean;
    enableComments: boolean;
    enableNewsletter: boolean;
    enableSearch: boolean;
  };
  
  // UI Configuration
  ui: {
    postsPerPage: number;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export const SITE_CONFIG: SiteConfig = {
  site: {
    name: 'Naranyala',
    tagline: 'Sharing stories, experiences, and creative projects',
    description: 'A personal blog about travel, lifestyle, creativity, and intentional living',
    url: 'https://naranyala.com', // Update with your actual domain
  },
  
  author: {
    name: 'Naranyala',
    bio: 'A creative soul with a passion for storytelling and connecting with people around the world.',
    location: 'Earth', // Can be specific like 'South Africa' or general like 'Earth'
    email: 'hello@example.com', // Update with your actual email
  },
  
  copyright: {
    year: new Date().getFullYear(), // Automatically updates each year
    holder: 'Naranyala',
  },
  
  social: {
    instagram: 'https://instagram.com', // Update with your actual profile
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    youtube: 'https://youtube.com',
  },
  
  publicLinks: {
    enabled: true, // Set to false to hide the public links card
    links: [
      {
        title: 'Photography Resources',
        url: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID', // Update with your actual link
      },
      {
        title: 'Travel Templates',
        url: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID', // Update with your actual link
      },
      {
        title: 'Creative Assets',
        url: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID', // Update with your actual link
      },
      {
        title: 'Wellness Guides',
        url: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID', // Update with your actual link
      },
    ],
  },
  
  features: {
    showDevelopmentBanner: true, // Set to false when site is ready
    enableComments: false, // Enable when comments system is added
    enableNewsletter: false, // Enable when newsletter is set up
    enableSearch: true,
  },
  
  ui: {
    postsPerPage: 10,
    dateFormat: 'MMMM DD, YYYY',
    theme: 'dark', // 'light', 'dark', or 'auto'
  },
};

/**
 * Helper function to get current year for copyright
 */
export function getCurrentYear(): number {
  return SITE_CONFIG.copyright.year;
}

/**
 * Helper function to get author email
 */
export function getContactEmail(): string {
  return SITE_CONFIG.author.email;
}

/**
 * Helper function to get all social links as array
 */
export function getSocialLinks(): Array<{ platform: string; url: string }> {
  const social = SITE_CONFIG.social;
  return Object.entries(social)
    .filter(([_, url]) => url !== undefined)
    .map(([platform, url]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      url: url!,
    }));
}

/**
 * Helper function to check if site is in development mode
 */
export function isDevelopmentMode(): boolean {
  return SITE_CONFIG.features.showDevelopmentBanner;
}

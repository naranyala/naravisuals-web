/**
 * App Content Service
 * Centralized content management for the entire application
 * 
 * All content (social links, FAQs, blog posts, about cards) is managed here
 * Edit this file to update content across the app
 */
import { Injectable } from '@angular/core';
import { Observable, of, type ObservableInput } from 'rxjs';
import { SITE_CONFIG, getSocialLinks } from '../config/site.config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SocialLink {
  icon: string;
  label: string;
  url: string;
  color: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
}

export interface DemoCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  content: string;
  link?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon name for social media platform
 */
function getIconForPlatform(platform: string): string {
  const iconMap: Record<string, string> = {
    instagram: 'brandInstagram',
    facebook: 'brandFacebook',
    twitter: 'brandTwitter',
    linkedin: 'brandLinkedin',
    github: 'brandGithub',
    youtube: 'brandYoutube',
    email: 'mail',
  };
  return iconMap[platform] || 'link';
}

/**
 * Get brand color for social media platform
 */
function getColorForPlatform(platform: string): string {
  const colorMap: Record<string, string> = {
    instagram: '#e4405f',
    facebook: '#1877f2',
    twitter: '#1d9bf0',
    linkedin: '#0a66c2',
    github: '#f0f6fc',
    youtube: '#ff0000',
    email: '#ea4335',
  };
  return colorMap[platform] || '#8b949e';
}

// ============================================================================
// CENTRALIZED CONTENT CONFIGURATION
// Edit the content below to update your entire app
// ============================================================================

const APP_CONTENT = {
  // ==========================================================================
  // SOCIAL LINKS (Connect Card) - Dynamically generated from config
  // ==========================================================================
  socialLinks: getSocialLinks().map(link => ({
    icon: getIconForPlatform(link.platform.toLowerCase()),
    label: link.platform,
    url: link.url,
    color: getColorForPlatform(link.platform.toLowerCase()),
  })) as SocialLink[],

  // ==========================================================================
  // FAQ (FAQ Card)
  // ==========================================================================
  faqs: [
    {
      question: `Who is ${SITE_CONFIG.author.name}?`,
      answer:
        `<p>${SITE_CONFIG.author.bio} Welcome to my corner of the internet!</p>`,
    },
    {
      question: 'What is this blog about?',
      answer:
        `<p>This blog covers topics close to my heart - from personal reflections and travel adventures to creative projects and life lessons.</p>`,
    },
    {
      question: 'How often do you post?',
      answer:
        `<p>I aim to share new content regularly, typically whenever inspiration strikes or I have something meaningful to share.</p>`,
    },
    {
      question: 'Can I collaborate with you?',
      answer:
        `<p>Absolutely! I'm always open to interesting collaborations and conversations. Feel free to reach out through the contact information.</p>`,
    },
    {
      question: 'Where are you based?',
      answer:
        `<p>I'm currently based in ${SITE_CONFIG.author.location}, creating content and exploring the world around me.</p>`,
    },
    {
      question: 'How can I stay updated?',
      answer:
        `<p>Follow me on social media or subscribe to receive notifications when new content is published!</p>`,
    },
    {
      question: 'Can I share your content?',
      answer:
        `<p>Yes! Please feel free to share my posts. I only ask that you give proper credit and link back to the original content.</p>`,
    },
    {
      question: 'Do you accept guest posts?',
      answer:
        `<p>I occasionally feature guest contributions from fellow creators. Reach out if you have an interesting story to tell!</p>`,
    },
  ] as FAQItem[],

  // ==========================================================================
  // ABOUT CARDS (Personal Blog Categories)
  // ==========================================================================
  demoCards: [
    {
      title: 'About Me',
      description:
        'Get to know the person behind this blog - my story, passions, and what drives me.',
      icon: '👋',
      color: '#6366f1',
      content: `
        <h2>Hello! I'm Naranyala</h2>
        <p>Welcome to my personal blog! I'm a creative soul with a passion for storytelling and connecting with people around the world.</p>
        <h3>What I Love</h3>
        <ul>
          <li>📸 Photography and visual storytelling</li>
          <li>✈️ Traveling and exploring new cultures</li>
          <li>📝 Writing and sharing personal experiences</li>
          <li>🎨 Creative projects and artistic expression</li>
          <li>🌱 Personal growth and self-discovery</li>
        </ul>
        <h3>My Mission</h3>
        <p>Through this blog, I hope to inspire others, share meaningful moments, and create a community of like-minded individuals who appreciate authentic storytelling.</p>
        <p><strong>Location:</strong> South Africa</p>
        <p><strong>Interests:</strong> Travel, Photography, Lifestyle, Personal Development</p>
      `,
    },
    {
      title: 'Travel Stories',
      description:
        'Adventures, destinations, and travel tips from my journeys around the world.',
      icon: '✈️',
      color: '#f59e0b',
      content: `
        <h2>Travel Stories</h2>
        <p>Travel opens our minds and hearts to new possibilities. Here you'll find:</p>
        <ul>
          <li>Destination guides and recommendations</li>
          <li>Travel tips and practical advice</li>
          <li>Photo essays from beautiful places</li>
          <li>Cultural experiences and local insights</li>
          <li>Packing guides and travel hacks</li>
        </ul>
        <h3>Recent Adventures</h3>
        <p>From the stunning landscapes of South Africa to hidden gems around the globe, I share authentic travel experiences that go beyond the typical tourist trail.</p>
        <p><strong>Favorite Destinations:</strong> Cape Town, Garden Route, Kruger National Park</p>
      `,
      link: '#travel',
    },
    {
      title: 'Lifestyle',
      description:
        'Daily life, wellness, home, and finding balance in a busy world.',
      icon: '🏡',
      color: '#10b981',
      content: `
        <h2>Lifestyle & Wellness</h2>
        <p>Living intentionally and finding joy in everyday moments:</p>
        <ul>
          <li>🧘 Wellness and self-care routines</li>
          <li>🏠 Home decor and organization</li>
          <li>🍳 Recipes and food adventures</li>
          <li>💪 Fitness and healthy living</li>
          <li>📚 Books, podcasts, and inspiration</li>
        </ul>
        <h3>My Philosophy</h3>
        <p>I believe in living mindfully, surrounding ourselves with beauty, and making time for what truly matters. This section shares my journey toward a more balanced, intentional life.</p>
        <p><strong>Focus Areas:</strong> Mindfulness, Home, Health, Creativity</p>
      `,
      link: '#lifestyle',
    },
    {
      title: 'Creative Projects',
      description:
        'Art, photography, DIY projects, and other creative endeavors I\'m working on.',
      icon: '🎨',
      color: '#ec4899',
      content: `
        <h2>Creative Projects</h2>
        <p>Creativity is at the heart of everything I do. Explore:</p>
        <ul>
          <li>📷 Photography portfolios and tips</li>
          <li>🎨 Art projects and creative experiments</li>
          <li>✂️ DIY tutorials and crafts</li>
          <li>💡 Creative process and inspiration</li>
          <li>🎬 Video content and visual stories</li>
        </ul>
        <h3>Why Create?</h3>
        <p>Creating is how I make sense of the world and connect with others. Whether it's through a photograph, a written piece, or a hands-on project, I love bringing ideas to life.</p>
        <p><strong>Current Focus:</strong> Photography, Visual Design, Content Creation</p>
      `,
      link: '#creative',
    },
    {
      title: 'Personal Growth',
      description:
        'Reflections, lessons learned, and thoughts on living a meaningful life.',
      icon: '🌱',
      color: '#8b5cf6',
      content: `
        <h2>Personal Growth</h2>
        <p>The journey of becoming is lifelong. Topics I explore:</p>
        <ul>
          <li>💭 Personal reflections and insights</li>
          <li>🎯 Goal setting and achievement</li>
          <li>🧠 Mindset and mental health</li>
          <li>📖 Life lessons and learnings</li>
          <li>🌟 Motivation and inspiration</li>
        </ul>
        <h3>My Journey</h3>
        <p>I share openly about the ups and downs of personal development - the breakthroughs, setbacks, and everything in between. Because growth isn't linear, and that's okay.</p>
        <p><strong>Themes:</strong> Authenticity, Resilience, Purpose, Connection</p>
      `,
      link: '#growth',
    },
    {
      title: 'Get In Touch',
      description:
        'Let\'s connect! Ways to reach out, collaborate, or just say hello.',
      icon: '💌',
      color: '#06b6d4',
      content: `
        <h2>Let's Connect</h2>
        <p>I'd love to hear from you! Whether you have a question, collaboration idea, or just want to say hello, feel free to reach out.</p>
        <h3>Ways to Connect</h3>
        <ul>
          <li>📧 Email: hello@example.com</li>
          <li>📱 Social Media: Links in the Connect card</li>
          <li>💬 Comments: Leave thoughts on blog posts</li>
          <li>🤝 Collaborations: Open to creative partnerships</li>
        </ul>
        <h3>Response Time</h3>
        <p>I try to respond to all messages within a few days. If you haven't heard back, feel free to follow up!</p>
        <p><strong>Available For:</strong> Collaborations, Speaking, Creative Projects</p>
      `,
      link: 'mailto:hello@example.com',
    },
  ] as DemoCard[],
};

// ============================================================================
// CONTENT SERVICE
// Inject this service in your components to access content
// ============================================================================

@Injectable({
  providedIn: 'root',
})
export class AppContentService {
  /**
   * Get all social links
   */
  getSocialLinks(): SocialLink[] {
    return APP_CONTENT.socialLinks;
  }

  /**
   * Get all FAQ items
   */
  getFAQs(): FAQItem[] {
    return APP_CONTENT.faqs;
  }

  /**
   * Get all demo cards
   */
  getDemoCards(): DemoCard[] {
    return APP_CONTENT.demoCards;
  }

  /**
   * Get a single demo card by title
   */
  getDemoCardByTitle(title: string): DemoCard | undefined {
    return APP_CONTENT.demoCards.find(card => card.title === title);
  }

  /**
   * Get a single FAQ by question (case-insensitive)
   */
  getFAQByQuestion(question: string): FAQItem | undefined {
    return APP_CONTENT.faqs.find(
      faq => faq.question.toLowerCase() === question.toLowerCase()
    );
  }

  /**
   * Search social links by label
   */
  searchSocialLinks(query: string): SocialLink[] {
    const lowerQuery = query.toLowerCase();
    return APP_CONTENT.socialLinks.filter(link =>
      link.label.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Search FAQs by question or answer
   */
  searchFAQs(query: string): FAQItem[] {
    const lowerQuery = query.toLowerCase();
    return APP_CONTENT.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Search demo cards by title or description
   */
  searchDemoCards(query: string): DemoCard[] {
    const lowerQuery = query.toLowerCase();
    return APP_CONTENT.demoCards.filter(
      card =>
        card.title.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery)
    );
  }
}

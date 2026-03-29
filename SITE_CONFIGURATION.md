# Site Configuration Guide

## 📁 Location

All site-wide configuration is centralized in:
```
src/app/shared/config/site.config.ts
```

## 🎯 What's Configurable

### 1. Site Information
```typescript
site: {
  name: 'Your Blog Name',
  tagline: 'Your tagline here',
  description: 'SEO description',
  url: 'https://yourdomain.com',
}
```

### 2. Author Information
```typescript
author: {
  name: 'Your Name',
  bio: 'Your bio',
  location: 'Your Location',
  email: 'your@email.com',
}
```

### 3. Copyright
```typescript
copyright: {
  year: new Date().getFullYear(), // Auto-updates!
  holder: 'Your Name',
}
```

### 4. Social Media Links
```typescript
social: {
  instagram: 'https://instagram.com/yourprofile',
  facebook: 'https://facebook.com/yourprofile',
  twitter: 'https://twitter.com/yourprofile',
  linkedin: 'https://linkedin.com/in/yourprofile',
  github: 'https://github.com/yourprofile',
  youtube: 'https://youtube.com/yourchannel',
}
```

### 5. Feature Flags
```typescript
features: {
  showDevelopmentBanner: true,  // Show/hide dev banner
  enableComments: false,         // Enable when ready
  enableNewsletter: false,       // Enable when ready
  enableSearch: true,            // Enable search
}
```

### 6. UI Settings
```typescript
ui: {
  postsPerPage: 10,
  dateFormat: 'MMMM DD, YYYY',
  theme: 'dark', // 'light', 'dark', or 'auto'
}
```

## ✏️ How to Customize

### Step 1: Update Basic Information

Open `src/app/shared/config/site.config.ts` and update:

```typescript
export const SITE_CONFIG: SiteConfig = {
  site: {
    name: 'My Awesome Blog',  // ← Your blog name
    tagline: 'Living intentionally',  // ← Your tagline
    description: 'A blog about life, travel, and creativity',
    url: 'https://myblog.com',  // ← Your domain
  },
  
  author: {
    name: 'Jane Doe',  // ← Your name
    bio: 'Writer, traveler, creator',  // ← Your bio
    location: 'New York',  // ← Your location
    email: 'jane@myblog.com',  // ← Your email
  },
  
  // ... rest of config
};
```

### Step 2: Update Social Media Links

Add your actual profile URLs:

```typescript
social: {
  instagram: 'https://instagram.com/janedoe',
  facebook: 'https://facebook.com/janedoe',
  twitter: 'https://twitter.com/janedoe',
  // Add or remove platforms as needed
}
```

### Step 3: Toggle Features

Enable/disable features:

```typescript
features: {
  showDevelopmentBanner: false,  // Turn off when site is ready
  enableComments: true,  // Enable when you add comments system
  enableNewsletter: true,  // Enable when you add newsletter
  enableSearch: true,
}
```

## 🔄 What Updates Automatically

When you change the config, these update automatically:

### Footer
- Copyright year (auto-updates every year!)
- Copyright holder name
- Contact email link

### Social Links Card
- All social media links
- Platform icons
- Brand colors

### FAQ
- Author name in questions
- Author bio
- Location information

### About Card
- Tagline with location
- Site name

## 🎨 Benefits

### ✅ Single Source of Truth
Change once, update everywhere

### ✅ Type-Safe
TypeScript ensures you don't make mistakes

### ✅ Auto-Updates
Copyright year updates automatically

### ✅ Consistent
Same data across all components

### ✅ Easy to Maintain
No hunting through multiple files

## 📝 Example: Complete Rebrand

Let's say you want to rebrand your blog:

**Before:**
```typescript
author: {
  name: 'Naranyala',
  location: 'Earth',
  email: 'hello@example.com',
}
```

**After:**
```typescript
author: {
  name: 'Alex Johnson',
  location: 'San Francisco, CA',
  email: 'alex@alexjohnson.com',
}
```

**What Updates Automatically:**
- ✅ Footer copyright
- ✅ FAQ questions
- ✅ About card tagline
- ✅ Contact email links
- ✅ Social media cards

## 🔧 Helper Functions

The config exports helper functions:

```typescript
import { 
  getCurrentYear, 
  getContactEmail, 
  getSocialLinks,
  isDevelopmentMode 
} from './config/site.config';

// Get current year
const year = getCurrentYear(); // 2026

// Get contact email
const email = getContactEmail(); // 'hello@example.com'

// Get all social links as array
const links = getSocialLinks(); 
// [{ platform: 'Instagram', url: '...' }, ...]

// Check if in development mode
const isDev = isDevelopmentMode(); // true/false
```

## 🚀 Advanced: Environment-Specific Config

For different environments (dev, staging, production):

```typescript
// src/app/shared/config/site.config.ts
const env = environment.production ? 'production' : 'development';

export const SITE_CONFIG: SiteConfig = {
  site: {
    name: env === 'production' ? 'My Blog' : 'My Blog (Dev)',
    url: env === 'production' ? 'https://myblog.com' : 'http://localhost:4200',
    // ...
  },
  // ...
};
```

## 📖 Best Practices

1. **Use environment variables** for sensitive data (API keys, etc.)
2. **Keep it DRY** - Don't repeat config values in components
3. **Type safety** - Always use the `SiteConfig` interface
4. **Document changes** - Note when you update major config values
5. **Test changes** - Run `bun run dev` to preview before deploying

## 🎯 Quick Reference

| What to Change | Where to Edit |
|---------------|---------------|
| Blog name | `site.name` |
| Tagline | `site.tagline` |
| Your name | `author.name` |
| Your email | `author.email` |
| Location | `author.location` |
| Social links | `social.*` |
| Copyright | `copyright.holder` |
| Dev banner | `features.showDevelopmentBanner` |

---

**Last Updated:** March 30, 2026

**Need Help?** Check the main README.md for more documentation.

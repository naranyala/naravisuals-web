# Centralized Content Management

This project uses a **centralized content service** to manage all application content from a single location.

## 📁 Location

All content is managed in:
```
src/app/shared/services/app-content.service.ts
```

## 🎯 What's Centralized?

The following content areas are now controlled from a single file:

| Content Area | Component | Description |
|-------------|-----------|-------------|
| **Social Links** | `SocialLinksComponent` | Connect card with social media links |
| **FAQ** | `FaqComponent` | FAQ card with questions and answers |
| **Blog Categories** | `DemoComponent` | Personal blog category cards |
| **Articles** | `ArticleService` | Markdown-based articles (already bundled) |

## ✏️ How to Edit Content

### 1. Open the Content Service

Navigate to `src/app/shared/services/app-content.service.ts`

### 2. Find the Content Section

The file is organized into clear sections:

```typescript
const APP_CONTENT = {
  // SOCIAL LINKS (Connect Card)
  socialLinks: [...],
  
  // FAQ (FAQ Card)
  faqs: [...],
  
  // BLOG CATEGORIES (About/Demo Cards)
  demoCards: [...],
};
```

### 3. Edit the Content

#### Example: Add a Social Link

```typescript
socialLinks: [
  {
    icon: 'brandInstagram',  // Tabler icon name
    label: 'Instagram',      // Display text
    url: 'https://instagram.com', // Link URL
    color: '#e4405f',        // Hover color
  },
  // Add new link here
  {
    icon: 'brandYoutube',
    label: 'YouTube',
    url: 'https://youtube.com',
    color: '#ff0000',
  },
],
```

#### Example: Add FAQ Item

```typescript
faqs: [
  {
    question: 'Your question here?',
    answer: '<p>Your answer with <strong>HTML</strong> support.</p>',
  },
  // Add new FAQ here
],
```

#### Example: Add Blog Category Card

```typescript
demoCards: [
  {
    title: 'New Category',
    description: 'Brief description of this category',
    icon: '🆕',
    color: '#123456',
    content: `
      <h2>Detailed Content</h2>
      <p>Full HTML content with lists, links, etc.</p>
    `,
    link: '#new-category', // Optional
  },
],
```

## 🔧 Available Icon Names

The project uses **Tabler Icons**. Common icons include:

- `brandInstagram`, `brandFacebook`, `brandTwitter`, `brandYoutube`
- `mail`, `message`, `phone`, `mapPin`
- `heart`, `star`, `sparkles`, `flower`
- `camera`, `photo`, `video`, `microphone`
- `plane`, `world`, `map`, `compass`
- `book`, `pencil`, `palette`, `music`

See [Tabler Icons](https://tabler-icons.io/) for the full list.

## 🎨 Content Structure

### Social Link
```typescript
{
  icon: string;      // Tabler icon name
  label: string;     // Display text
  url: string;       // External link
  color: string;     // Hex color for hover effect
}
```

### FAQ Item
```typescript
{
  question: string;  // Question text
  answer: string;    // HTML content
}
```

### Blog Category Card
```typescript
{
  title: string;       // Card title
  description: string; // Short description
  icon: string;        // Emoji
  color: string;       // Theme color
  content: string;     // Full HTML content
  link?: string;       // Optional link
}
```

### Article (from markdown)
```typescript
{
  id: string;        // Unique identifier
  title: string;     // Article title
  content: string;   // Markdown content
}
```

## 📝 Best Practices

1. **Edit only `app-content.service.ts`** - Don't modify individual component content
2. **Keep content consistent** - Use similar formatting across all items
3. **Test changes** - Run `bun run dev` to preview changes
4. **HTML in answers** - Use `<p>`, `<strong>`, `<code>`, `<ul>`, `<li>` tags
5. **Escape quotes** - Use single quotes inside strings, or escape with `\"`
6. **Use emojis** - Emojis add personality to card icons

## 🚀 For Articles (Markdown Files)

Articles are still managed via markdown files in `/docs`:

1. Add `.md` file to `/docs` folder
2. The build process automatically bundles it
3. Content appears in article list automatically

## 🔍 Using the Service in Components

The content service is already injected in these components:

- `FaqComponent` → `this.contentService.getFAQs()`
- `SocialLinksComponent` → `this.contentService.getSocialLinks()`
- `DemoComponent` → `this.contentService.getDemoCards()`

If you need content elsewhere:

```typescript
import { AppContentService } from '../shared/services/app-content.service';

// In your component
private readonly contentService = inject(AppContentService);

// Get content
const faqs = this.contentService.getFAQs();
const socialLinks = this.contentService.getSocialLinks();
const demoCards = this.contentService.getDemoCards();
```

## 🎯 Benefits

✅ **Single source of truth** - All content in one place  
✅ **Easy to update** - No need to search through multiple files  
✅ **Type-safe** - TypeScript ensures content structure  
✅ **Reusable** - Same content can be used in multiple places  
✅ **Maintainable** - Clear separation of content and logic  

## 📖 Example: Complete Content Update

Let's say you want to update all content for a new season:

1. Open `app-content.service.ts`
2. Update social links (add new platforms)
3. Modify FAQ questions/answers
4. Change blog category descriptions
5. Save and rebuild

All changes propagate automatically to all components!

---

**Last Updated:** March 30, 2026

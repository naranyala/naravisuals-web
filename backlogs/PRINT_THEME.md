# Print Theme - Paper-Like White Theme

## Overview

The print view now uses a **professional paper-like white theme** optimized for readability and printer-friendliness. When you click the print button in the top navbar, it opens a new tab with a clean, professional document layout.

## Design Philosophy

The print theme follows these principles:

1. **Paper-First Design** - Mimics professional printed documents
2. **Readability** - Clear typography with proper spacing
3. **Printer-Friendly** - Optimized for A4 paper with proper margins
4. **Consistency** - Uniform styling across all content types

## Key Features

### 📄 Typography
- **Font**: Georgia, Times New Roman, Palatino Linotype (serif fonts for readability)
- **Size**: 11pt body text (optimal for print)
- **Line Height**: 1.6 (comfortable reading)
- **Text Alignment**: Justified paragraphs for professional look
- **Colors**: Dark text (#1a1a1a) on white background

### 📐 Layout
- **Page Size**: A4
- **Margins**: 2cm top/bottom, 1.8cm left/right
- **Section Breaks**: Page breaks between documents
- **No Widows/Orphans**: Smart page break handling

### 💻 Code Blocks
- **Background**: Light gray (#fafafa)
- **Border**: Left accent line in blue (#3b82f6)
- **Font**: Monospace (SF Mono, Monaco, Inconsolata)
- **Size**: 9.5pt (slightly smaller for code)
- **Print-Safe**: Avoids page breaks inside code blocks

### 📊 Mermaid Diagrams
- **Background**: White (no backgrounds)
- **Text**: Dark (#1a1a1a) for readability
- **Lines**: Dark gray (#374151) for clarity
- **Borders**: Subtle gray border
- **Print-Safe**: Avoids page breaks inside diagrams

### 📋 Tables
- **Borders**: Clean, minimal borders
- **Headers**: Light gray background (#f3f4f6)
- **Top/Bottom**: Strong borders (2px) for definition
- **Print-Safe**: Avoids page breaks inside tables

### 📢 Admonitions/Callouts
- **Style**: Left colored border indicates type
  - Note: Blue (#3b82f6)
  - Tip: Green (#10b981)
  - Warning: Yellow (#f59e0b) with yellow background
  - Danger: Red (#ef4444) with red background
- **Background**: Light gray (#fafafa) for subtlety

### 🔗 Links
- **Color**: Blue (#2563eb)
- **Decoration**: Underline with light blue border
- **External Links**: Shows "↗" indicator
- **Print URLs**: Shows full URL in parentheses when printed

### 🖼️ Images
- **Border**: Light gray border with rounded corners
- **Margins**: Proper spacing around images
- **Print-Safe**: Avoids page breaks inside images

### 📐 Math
- **Inline**: Light background with border
- **Display**: Centered, no background
- **Font**: Times New Roman, Georgia (serif)

## Print Header

The print view includes a sticky header with:
- **Title**: Site name on the left
- **Print Button**: "🖨️ Print This Document" button on the right
- **Hidden When Printing**: Header disappears in actual print

## Page Break Handling

Smart page breaks ensure:
- ✅ Code blocks don't split across pages
- ✅ Tables stay together
- ✅ Images don't get cut in half
- ✅ Mermaid diagrams remain intact
- ✅ Admonitions stay together
- ✅ Headings don't end pages alone

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| **Body Text** | `#1a1a1a` | Main content |
| **Headings** | `#111` - `#4b5563` | Hierarchy |
| **Code** | `#d63384` | Inline code |
| **Code Blocks** | `#fafafa` | Background |
| **Borders** | `#e5e7eb` - `#374151` | Separation |
| **Links** | `#2563eb` | Hyperlinks |
| **Accent** | `#3b82f6` | Code block border |

## Responsive Design

The print theme works on all paper sizes:
- **A4** (default): 210mm × 297mm
- **Letter**: Automatically adjusts
- **Custom**: Scales appropriately

## Hidden Elements

These elements are hidden in print view:
- ❌ Top navigation bar
- ❌ Sidebar
- ❌ Table of contents
- ❌ Code copy buttons
- ❌ Code headers
- ❌ Hash links
- ❌ Document stats footer
- ❌ Mermaid zoom/download buttons
- ❌ Error states

## How to Use

1. Click the **🖨️** button in the top navbar
2. A new tab opens with the print-ready document
3. Click **"Print This Document"** button
4. Select your printer and print!

## Technical Details

### CSS Properties Used
```css
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
```

These ensure colors are preserved when printing (some browsers default to grayscale).

### Page Break Properties
```css
page-break-inside: avoid;
page-break-after: always;
page-break-before: avoid;
```

These control where pages break for optimal readability.

## Comparison: Before vs After

### Before
- Basic styling with minimal attention to print quality
- System fonts (sans-serif)
- No page break handling
- Inconsistent spacing
- Poor code block presentation

### After
- Professional serif fonts for readability
- Smart page break handling
- Consistent, professional spacing
- Clean code blocks with accent borders
- Printer-friendly admonitions
- Proper mermaid diagram rendering
- Optimized for A4 paper

## Future Enhancements

Potential improvements:
- [ ] Add table of contents page
- [ ] Add page numbers
- [ ] Add document metadata page
- [ ] Support for custom paper sizes
- [ ] Add headers/footers with page numbers
- [ ] Support for double-sided printing
- [ ] Add bookmarks for PDF export

## Files Modified

- **`src/App.tsx`** - Updated `printAllDocs()` function with new print HTML template

## Testing

Test the print theme by:
1. Running `bun run dev`
2. Opening any document
3. Clicking the print button (🖨️)
4. Reviewing the print preview
5. Checking that all elements render correctly

## Browser Support

The print theme works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Print quality may vary depending on printer settings and browser print dialog options.

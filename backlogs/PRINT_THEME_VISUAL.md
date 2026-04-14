# Print Theme Visual Guide

## What Changed

### Before (Old Print Theme)
```
┌─────────────────────────────────────────────┐
│  [🖨️ Print]                     (Blue Btn) │
├─────────────────────────────────────────────┤
│                                             │
│  Article Title                              │
│  =============                              │
│                                             │
│  Some text with basic styling...            │
│                                             │
│  ```code                                    │
│  plain background                             │
│  ```                                        │
│                                             │
│  [Diagram] (basic rendering)                │
│                                             │
└─────────────────────────────────────────────┘
```

### After (New Paper-Like Theme)
```
┌─────────────────────────────────────────────┐
│  Site Name        [🖨️ Print This Document]  │
├─────────────────────────────────────────────┤
│                                             │
│  Article Title                              │
│  ═══════════════ (2px solid border)         │
│                                             │
│  Lorem ipsum dolor sit amet, consectetur    │
│  adipiscing elit. Sed do eiusmod tempor     │
│  incididunt ut labore et dolore...          │
│                                             │
│  ## Section Heading                         │
│                                             │
│  ┃ ```code block with left blue accent      │
│  ┃ background: #fafafa                      │
│  ┃ border-left: 3px solid #3b82f6           │
│  ```                                        │
│                                             │
│  ┌──────────────────────────────┐           │
│  │   [Mermaid Diagram]          │           │
│  │   Dark text, clear lines     │           │
│  │   White background           │           │
│  └──────────────────────────────┘           │
│                                             │
│  ┌──────────────────────────────┐           │
│  │ 💡 Tip: Admonition with      │           │
│  │    green left border          │           │
│  └──────────────────────────────┘           │
│                                             │
│  Table with clean borders:                  │
│  ┌────────┬────────┬────────┐               │
│  │ Header │ Header │ Header │ (gray bg)     │
│  ├────────┼────────┼────────┤               │
│  │ Cell   │ Cell   │ Cell   │               │
│  └────────┴────────┴────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

## Key Visual Improvements

### 1. Typography
**Before:**
- Font: System sans-serif
- Size: Variable
- Spacing: Inconsistent

**After:**
- Font: Georgia/Times New Roman (serif)
- Size: 11pt (optimal for print)
- Spacing: Consistent 1.6 line-height
- Justified paragraphs

### 2. Code Blocks
**Before:**
- Plain background
- No visual distinction
- Basic styling

**After:**
- Light gray background (#fafafa)
- Blue left accent border (3px)
- Rounded corners
- Proper padding
- Monospace fonts (9.5pt)

### 3. Mermaid Diagrams
**Before:**
- Basic rendering
- Light text sometimes hard to read

**After:**
- Dark text (#1a1a1a) forced
- White background
- Subtle border
- Centered alignment
- Dark lines and edges (#374151)
- Print-safe (no page breaks)

### 4. Tables
**Before:**
- Basic borders
- Alternating row colors

**After:**
- Strong top/bottom borders (2px)
- Light gray header background
- Clean cell borders
- Professional spacing

### 5. Admonitions
**Before:**
- Colored borders
- Basic styling

**After:**
- Colored left border (indicates type)
- Light background (#fafafa)
- Rounded corners
- Proper padding
- Type-specific backgrounds (warning: yellow, danger: red)

### 6. Page Layout
**Before:**
- No page break handling
- Elements could split across pages

**After:**
- Smart page breaks
- Code blocks stay together
- Tables stay together
- Images don't split
- Diagrams remain intact
- Proper margins (2cm/1.8cm)

## Print Preview Experience

### User Flow
1. User clicks 🖨️ button in navbar
2. New tab opens with print-ready document
3. Clean, professional layout visible
4. User clicks "Print This Document"
5. Browser print dialog opens
6. Print preview shows:
   - No header (hidden in print)
   - Clean pages with proper margins
   - Professional typography
   - All content properly formatted

### Print Dialog Preview
```
┌────────────────────────────────────┐
│  Print Dialog                      │
├────────────────────────────────────┤
│  Preview:                          │
│                                    │
│  ┌──────────────────────────┐      │
│  │  Article Title           │      │
│  │  ═══════════════         │      │
│  │                          │      │
│  │  Professional content... │      │
│  │                          │      │
│  │  [Code block]            │      │
│  │  [Diagram]               │      │
│  │                          │      │
│  └──────────────────────────┘      │
│                                    │
│  Printer: [Select...]              │
│  Pages:  All                       │
│  Copies:  1                        │
│                                    │
│  [Cancel]  [Print]                 │
└────────────────────────────────────┘
```

## Color Scheme Reference

### Light Paper Theme Colors
```
Background:     #ffffff (white)
Text Primary:   #1a1a1a (near-black)
Text Secondary: #374151 (dark gray)
Text Muted:     #6b7280 (medium gray)

Code Inline:    #d63384 (pink/magenta)
Code Block BG:  #fafafa (light gray)
Code Accent:    #3b82f6 (blue border)

Links:          #2563eb (blue)
Link Border:    #bfdbfe (light blue)

Borders Light:  #e5e7eb
Borders Medium: #d1d5db
Borders Strong: #374151

Admonitions:
  Note:         #3b82f6 (blue)
  Tip:          #10b981 (green)
  Warning:      #f59e0b (yellow)
  Danger:       #ef4444 (red)

Tables:
  Header BG:    #f3f4f6
  Border Top:   #374151 (2px)
  Border Cell:  #e5e7eb
```

## Responsive Breakpoints

### Screen View (Print Tab Opened)
- Full-width layout
- Sticky header visible
- Interactive elements work
- "Print This Document" button available

### Print View (After Clicking Print)
- Header hidden
- Proper A4 margins
- Page breaks applied
- Optimized for paper

### Mobile Print
- Scales appropriately
- Maintains readability
- No horizontal scroll

## Browser Print Settings

### Recommended Settings
For best results, users should:
- ✅ Enable "Background graphics" (prints colors)
- ✅ Set margins to "Default" or "Normal"
- ✅ Use "Portrait" orientation
- ✅ Select "A4" or "Letter" paper size
- ✅ Enable "Headers and footers" if desired

### What Gets Printed
- ✅ All text content
- ✅ Code blocks with styling
- ✅ Mermaid diagrams (rendered SVG)
- ✅ Tables with borders
- ✅ Admonitions with colored borders
- ✅ Images
- ✅ Math expressions

### What Doesn't Print
- ❌ Print header/button
- ❌ Navigation elements
- ❌ Sidebar
- ❌ Table of contents
- ❌ Interactive buttons
- ❌ Code copy buttons
- ❌ Document stats footer

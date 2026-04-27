export const SEARCH_ENGINES = [
  { name: "Google", icon: "🔍", url: "https://www.google.com/search?q=%s", category: "regular" },
  { name: "X.com", icon: "🐦", url: "https://x.com/search?q=%s", category: "regular" },
  {
    name: "YouTube",
    icon: "📺",
    url: "https://www.youtube.com/results?search_query=%s",
    category: "regular",
  },
  { name: "Reddit", icon: "🤖", url: "https://www.reddit.com/search/?q=%s", category: "regular" },
  { name: "Hacker News", icon: "🧡", url: "https://hn.algolia.com/?q=%s", category: "regular" },
  { name: "GitHub", icon: "🐙", url: "https://github.com/search?q=%s", category: "regular" },
  {
    name: "Wikipedia",
    icon: "📖",
    url: "https://en.wikipedia.org/wiki/Special:Search?search=%s",
    category: "regular",
  },
  {
    name: "Grokipedia",
    icon: "📚",
    url: "https://www.google.com/search?q=site:grokipedia.com+%s",
    category: "regular",
  },
  { name: "DuckDuckGo", icon: "🦆", url: "https://duckduckgo.com/?q=%s", category: "regular" },
  {
    name: "Google Images",
    icon: "🖼️",
    url: "https://www.google.com/search?tbm=isch&q=%s",
    category: "image",
  },
  {
    name: "X Images",
    icon: "📸",
    url: "https://www.google.com/search?tbm=isch&q=site:x.com+%s",
    category: "image",
  },
  {
    name: "Reddit Images",
    icon: "🎨",
    url: "https://www.google.com/search?tbm=isch&q=site:reddit.com+%s",
    category: "image",
  },
  {
    name: "ArtStation",
    icon: "🎨",
    url: "https://www.artstation.com/search?q=%s",
    category: "image",
  },
  {
    name: "Pinterest",
    icon: "📌",
    url: "https://www.pinterest.com/search/pins/?q=%s",
    category: "image",
  },
  {
    name: "GrabCAD",
    icon: "📐",
    url: "https://grabcad.com/library?query=%s",
    category: "3d-and-cad",
  },
  {
    name: "Thingiverse",
    icon: "📦",
    url: "https://www.thingiverse.com/search?q=%s",
    category: "3d-and-cad",
  },
  { name: "Thangs", icon: "💎", url: "https://thangs.com/search/all?q=%s", category: "3d-and-cad" },
  {
    name: "Cults3D",
    icon: "🎨",
    url: "https://cults3d.com/en/search?q=%s",
    category: "3d-and-cad",
  },
  {
    name: "MyMiniFactory",
    icon: "🏭",
    url: "https://www.myminifactory.com/search/?query=%s",
    category: "3d-and-cad",
  },
  { name: "Free3D", icon: "🆓", url: "https://free3d.com/3d-models/%s", category: "3d-and-cad" },
  {
    name: "Sketchfab",
    icon: "🌐",
    url: "https://sketchfab.com/search?q=%s&type=models",
    category: "3d-and-cad",
  },
];

export const SEARCH_CATEGORIES = [
  { id: "regular", label: "Regular Search", icon: "🌐" },
  { id: "image", label: "Image Search", icon: "🖼️" },
  { id: "3d-and-cad", label: "3D & CAD", icon: "📐" },
];

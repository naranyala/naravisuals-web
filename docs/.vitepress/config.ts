import { defineConfig } from 'vitepress'
import { createDynamicSidebar } from './sidebar.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const docsPath = join(__dirname, '..')

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: "naravisuals-web",
  description: "rust+tauri+vue",
  themeConfig: {
    sidebar: createDynamicSidebar(docsPath)
  }
})

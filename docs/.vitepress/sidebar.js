import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

function getFileInfo(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  let title = ''

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim()
      break
    }
  }

  if (!title) {
    const fileName = filePath.split('/').pop()?.replace('.md', '') || ''
    title = fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return { title }
}

function scanDirectory(dirPath, basePath = '') {
  const items = []

  try {
    const entries = readdirSync(dirPath)

    const files = entries.filter(entry => {
      const fullPath = join(dirPath, entry)
      const stat = statSync(fullPath)
      return stat.isFile() && extname(entry) === '.md'
    })

    // Sort files by filename
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    const fileInfos = files.map(file => {
      const fullPath = join(dirPath, file)
      const relativePath = join(basePath, file.replace('.md', ''))
      const { title } = getFileInfo(fullPath)
      return { file, title, link: `/${relativePath}` }
    })

    for (const { title, link } of fileInfos) {
      items.push({ text: title, link })
    }

    const directories = entries.filter(entry => {
      const fullPath = join(dirPath, entry)
      return statSync(fullPath).isDirectory() && !entry.startsWith('.')
    })

    for (const dir of directories) {
      const subItems = scanDirectory(join(dirPath, dir), join(basePath, dir))
      if (subItems.length > 0) {
        items.push({
          text: dir.charAt(0).toUpperCase() + dir.slice(1),
          items: subItems
        })
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error)
  }

  return items
}

export function createDynamicSidebar(docsPath) {
  const sidebar = []

  // Process backend-tauri directory
  const backendPath = join(docsPath, 'backend-tauri')
  if (statSync(backendPath).isDirectory()) {
    const backendItems = scanDirectory(backendPath, 'backend-tauri')
    if (backendItems.length > 0) {
      sidebar.push({
        text: "Backend - Tauri",
        items: backendItems
      })
    }
  }

  // Process frontend-vue directory
  const frontendPath = join(docsPath, 'frontend-vue')
  if (statSync(frontendPath).isDirectory()) {
    const frontendItems = scanDirectory(frontendPath, 'frontend-vue')
    if (frontendItems.length > 0) {
      sidebar.push({
        text: "Frontend - Vue",
        items: frontendItems
      })
    }
  }

  return sidebar
}
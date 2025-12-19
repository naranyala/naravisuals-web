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

      // Extract numbering from filename (assuming format like "01_02_article_title.md")
      // The user wants the second number (xx) from format 01_xx, not the first
      const numberingMatch = file.match(/^\d+_(\d+)_/)
      let formattedTitle = title
      if (numberingMatch) {
        const numbering = numberingMatch[1]  // Get the second number (e.g., "02" from "01_02")
        formattedTitle = `${numbering} - ${title}`
      } else {
        // If no numbering pattern found with two numbers, try to get at least the first number
        const firstNumberMatch = file.match(/^(\d+)_/)
        if (firstNumberMatch) {
          const numbering = firstNumberMatch[1]
          formattedTitle = `${numbering} - ${title}`
        } else {
          // If no numbering pattern found, just use the title as is
          formattedTitle = title
        }
      }

      return { file, title, formattedTitle, link: `/${relativePath}` }
    })

    for (const { formattedTitle, link } of fileInfos) {
      items.push({ text: formattedTitle, link })
    }

    const directories = entries.filter(entry => {
      const fullPath = join(dirPath, entry)
      return statSync(fullPath).isDirectory() && !entry.startsWith('.')
    })

    for (const dir of directories) {
      const subItems = scanDirectory(join(dirPath, dir), join(basePath, dir))
      if (subItems.length > 0) {
        // Count articles in this subdirectory for display purposes
        const articleCount = subItems.filter(item => item.link).length
        const countPrefix = articleCount > 0 ? `(${articleCount}) ` : ''
        items.push({
          text: `${countPrefix}${dir.charAt(0).toUpperCase() + dir.slice(1)}`,
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
  
  // Function to scan and create section items
  function createSectionItems(dirPath, basePath) {
    const items = []
    
    try {
      const entries = readdirSync(dirPath)
      const files = entries.filter(entry => {
        const fullPath = join(dirPath, entry)
        return statSync(fullPath).isFile() && extname(entry) === '.md'
      })
      
      // Sort files by filename
      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      
      for (const file of files) {
        const fullPath = join(dirPath, file)
        const { title } = getFileInfo(fullPath)
        
        // Extract numbering from filename
        let numbering = ''
        let formattedTitle = title
        
        const numberingMatch = file.match(/^\d+_(\d+)_/)
        if (numberingMatch) {
          numbering = numberingMatch[1]
          formattedTitle = `${numbering} - ${title}`
        } else {
          const firstNumberMatch = file.match(/^(\d+)_/)
          if (firstNumberMatch) {
            numbering = firstNumberMatch[1]
            formattedTitle = `${numbering} - ${title}`
          }
        }
        
        const link = `/${basePath}/${file.replace('.md', '')}`
        items.push({ text: formattedTitle, link })
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error)
    }
    
    return items
  }
  
  // Process backend-tauri directory
  const backendPath = join(docsPath, 'backend-tauri')
  if (statSync(backendPath).isDirectory()) {
    const backendItems = createSectionItems(backendPath, 'backend-tauri')
    if (backendItems.length > 0) {
      sidebar.push({
        text: `(${backendItems.length}) Backend - Tauri`,
        collapsed: false,
        items: backendItems
      })
    }
  }
  
  // Process frontend-vue directory
  const frontendPath = join(docsPath, 'frontend-vue')
  if (statSync(frontendPath).isDirectory()) {
    const frontendItems = createSectionItems(frontendPath, 'frontend-vue')
    if (frontendItems.length > 0) {
      sidebar.push({
        text: `(${frontendItems.length}) Frontend - Vue`,
        collapsed: false,
        items: frontendItems
      })
    }
  }
  
  // Process modules directory
  const modulesPath = join(docsPath, 'modules')
  if (statSync(modulesPath).isDirectory()) {
    const modulesItems = createSectionItems(modulesPath, 'modules')
    if (modulesItems.length > 0) {
      sidebar.push({
        text: `(${modulesItems.length}) Modules`,
        collapsed: false,
        items: modulesItems
      })
    }
  }
  
  return sidebar
}

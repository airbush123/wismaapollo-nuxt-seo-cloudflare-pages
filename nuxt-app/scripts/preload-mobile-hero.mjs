import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const heroPreload = '<link rel="preload" as="image" href="/images/hero-mobile.webp" type="image/webp" media="(max-width: 767px)" imagesrcset="/images/hero-mobile.webp 480w" imagesizes="100vw" fetchpriority="high">'
const heroPreloadSignature = 'rel="preload" as="image" href="/images/hero-mobile.webp"'
const outputDirs = ['.output/public', 'dist']

let updatedFiles = 0

async function injectHeroPreload(filePath) {
  const html = await readFile(filePath, 'utf8')

  if (!html.includes('<head>') || html.includes(heroPreloadSignature)) {
    return
  }

  await writeFile(filePath, html.replace('<head>', `<head>${heroPreload}`))
  updatedFiles += 1
}

async function walk(dirPath) {
  let entries

  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch {
    return
  }

  await Promise.all(entries.map(async (entry) => {
    const entryPath = join(dirPath, entry.name)

    if (entry.isDirectory()) {
      await walk(entryPath)
      return
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      await injectHeroPreload(entryPath)
    }
  }))
}

for (const dir of outputDirs) {
  await walk(dir)
}

console.log(`Mobile hero preload injected into ${updatedFiles} HTML files.`)

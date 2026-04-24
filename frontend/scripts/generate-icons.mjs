/**
 * generate-icons.mjs
 * Converts logo-icon.svg → PNG icons required by the PWA manifest.
 * Uses `sharp` (installed as devDependency). Wrapped in try/catch so the
 * build does not fail if sharp has native-binding issues on some platforms.
 */

import { readFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath }                        from 'url'
import { dirname, join }                        from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SVG_PATH  = join(__dirname, '../public/logo-icon.svg')
const OUT_DIR   = join(__dirname, '../public')

const ICONS = [
  { size: 64,  name: 'pwa-64x64.png'               },
  { size: 192, name: 'pwa-192x192.png'              },
  { size: 512, name: 'pwa-512x512.png'              },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 512, name: 'maskable-icon-512x512.png'    },
]

try {
  const { default: sharp } = await import('sharp')

  if (!existsSync(SVG_PATH)) {
    console.warn('[pwa-icons] logo-icon.svg not found — skipping icon generation')
    process.exit(0)
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const svgBuffer = readFileSync(SVG_PATH)

  for (const { size, name } of ICONS) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(join(OUT_DIR, name))
    console.log(`[pwa-icons] ✓ ${name}  (${size}×${size})`)
  }

  console.log('[pwa-icons] All icons generated successfully.')
} catch (err) {
  console.warn('[pwa-icons] Icon generation skipped:', err.message)
  console.warn('[pwa-icons] PWA will work without PNG icons on some platforms.')
}

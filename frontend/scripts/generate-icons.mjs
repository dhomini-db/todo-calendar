/**
 * generate-icons.mjs
 * ──────────────────
 * Converts logo-icon.svg → all PNG icons required by the PWA manifest.
 *
 * Output → public/icons/
 *   icon-64.png              regular 64×64
 *   icon-192.png             regular 192×192   ← Android home screen
 *   icon-512.png             regular 512×512   ← Chrome splash / store
 *   apple-touch-icon.png     180×180           ← iOS home screen
 *   maskable-512.png         512×512 full-bleed ← Android adaptive icon
 *
 * Maskable safe zone:
 *   Android adaptive icons crop the outer ~20% in a circle/squircle.
 *   The "safe zone" is the central 80% (= 409×409 inside 512×512).
 *   We add 12% padding each side so the artwork sits fully inside.
 *
 * Wrapped in try/catch — build continues even if sharp has native issues.
 */

import { readFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath }                        from 'url'
import { dirname, join }                        from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SVG_PATH  = join(__dirname, '../public/logo-icon.svg')
const OUT_DIR   = join(__dirname, '../public/icons')

// ── Regular icons (simple resize) ────────────────────────────────
const REGULAR_ICONS = [
  { size: 64,  name: 'icon-64.png'           },
  { size: 192, name: 'icon-192.png'          },
  { size: 512, name: 'icon-512.png'          },
  { size: 180, name: 'apple-touch-icon.png'  },
]

// ── Maskable icon config ──────────────────────────────────────────
// 12% padding on each side → 76% of 512 = 389px for the artwork
const MASKABLE_SIZE    = 512
const PADDING_RATIO    = 0.12                                         // 12% each side
const CONTENT_SIZE     = Math.round(MASKABLE_SIZE * (1 - PADDING_RATIO * 2)) // 389
const PADDING          = Math.round(MASKABLE_SIZE * PADDING_RATIO)           // 61
// Background colour matches the app's background_color in the manifest
const BG = { r: 13, g: 13, b: 13, alpha: 1 }  // #0d0d0d

try {
  const { default: sharp } = await import('sharp')

  if (!existsSync(SVG_PATH)) {
    console.warn('[pwa-icons] logo-icon.svg not found — skipping icon generation')
    process.exit(0)
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const svgBuffer = readFileSync(SVG_PATH)

  // ── Generate regular icons ──────────────────────────────────────
  for (const { size, name } of REGULAR_ICONS) {
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 95, compressionLevel: 8 })
      .toFile(join(OUT_DIR, name))
    console.log(`[pwa-icons] ✓ ${name}  (${size}×${size})`)
  }

  // ── Generate maskable icon (with safe-zone padding) ─────────────
  // Step 1: resize artwork to fit inside safe zone (76% of 512)
  const artworkBuffer = await sharp(svgBuffer)
    .resize(CONTENT_SIZE, CONTENT_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Step 2: composite artwork onto a full-bleed solid background
  await sharp({
    create: {
      width:    MASKABLE_SIZE,
      height:   MASKABLE_SIZE,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: artworkBuffer, top: PADDING, left: PADDING }])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(join(OUT_DIR, 'maskable-512.png'))

  console.log(`[pwa-icons] ✓ maskable-512.png  (${MASKABLE_SIZE}×${MASKABLE_SIZE}, padding ${PADDING}px / safe-zone ${CONTENT_SIZE}px)`)
  console.log('[pwa-icons] All icons generated successfully.')

} catch (err) {
  console.warn('[pwa-icons] Icon generation skipped:', err.message)
  console.warn('[pwa-icons] Tip: run  npm install  to ensure sharp native bindings are present.')
}

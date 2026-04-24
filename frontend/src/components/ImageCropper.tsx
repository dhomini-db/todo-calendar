/**
 * ImageCropper
 * ────────────
 * Canvas-based circular crop modal.
 *
 * • Drag (1 finger / mouse) → pan
 * • Pinch (2 fingers) or scroll wheel → zoom
 * • "Usar foto" → renders a 400×400 circle to a blob and calls onCrop(blob)
 * • "Cancelar" → calls onCancel()
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

// ── Constants ───────────────────────────────────────────────────
const CANVAS_SIZE  = 300   // visible canvas px (CSS will scale on mobile)
const OUTPUT_SIZE  = 400   // exported image px
const MIN_SCALE    = 0.5
const MAX_SCALE    = 8

// ── Props ────────────────────────────────────────────────────────
interface ImageCropperProps {
  src: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

// ── Component ────────────────────────────────────────────────────
export default function ImageCropper({ src, onCrop, onCancel }: ImageCropperProps) {
  const { t } = useLanguage()
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imageRef   = useRef<HTMLImageElement | null>(null)
  const stateRef   = useRef({ scale: 1, ox: 0, oy: 0 })   // live transform (no re-render)

  // drag / pinch tracking
  const dragRef    = useRef<{ id: number; sx: number; sy: number; sox: number; soy: number } | null>(null)
  const pinchRef   = useRef<{ id0: number; id1: number; x0: number; y0: number; x1: number; y1: number; sScale: number; sox: number; soy: number } | null>(null)

  const [ready, setReady] = useState(false)

  // ── Draw ──────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img    = imageRef.current
    if (!canvas || !img) return

    const ctx  = canvas.getContext('2d')!
    const S    = CANVAS_SIZE
    const { scale, ox, oy } = stateRef.current

    ctx.clearRect(0, 0, S, S)

    // --- image ---
    const w = img.width  * scale
    const h = img.height * scale
    const x = (S - w) / 2 + ox
    const y = (S - h) / 2 + oy
    ctx.drawImage(img, x, y, w, h)

    // --- dark overlay with circular cutout ---
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.58)'
    ctx.fillRect(0, 0, S, S)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // --- circle border ---
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth   = 1.5
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }, [])

  // ── Load image ────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      // Fit image to fill the circle
      const initScale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height)
      stateRef.current = { scale: initScale, ox: 0, oy: 0 }
      draw()
      setReady(true)
    }
    img.src = src
  }, [src, draw])

  // re-draw whenever state changes (triggered by pointer/wheel handlers)
  // nothing needed here — handlers call draw() directly after mutating stateRef

  // ── Pointer handlers (pan + pinch) ────────────────────────────
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const ids = [...activePointers.current.keys()]

    if (ids.length === 2) {
      // Start pinch
      const [id0, id1] = ids
      const p0 = activePointers.current.get(id0)!
      const p1 = activePointers.current.get(id1)!
      pinchRef.current = {
        id0, id1,
        x0: p0.x, y0: p0.y,
        x1: p1.x, y1: p1.y,
        sScale: stateRef.current.scale,
        sox: stateRef.current.ox,
        soy: stateRef.current.oy,
      }
      dragRef.current = null
    } else if (ids.length === 1) {
      // Start drag
      dragRef.current = {
        id: e.pointerId,
        sx: e.clientX, sy: e.clientY,
        sox: stateRef.current.ox, soy: stateRef.current.oy,
      }
      pinchRef.current = null
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const ids = [...activePointers.current.keys()]

    if (pinchRef.current && ids.length >= 2) {
      // Pinch zoom
      const p = pinchRef.current
      const p0 = activePointers.current.get(p.id0)
      const p1 = activePointers.current.get(p.id1)
      if (!p0 || !p1) return

      const prevDist = Math.hypot(p.x1 - p.x0, p.y1 - p.y0)
      const newDist  = Math.hypot(p1.x - p0.x, p1.y - p0.y)
      if (prevDist < 1) return

      const ratio    = newDist / prevDist
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.sScale * ratio))
      stateRef.current.scale = newScale
      draw()
    } else if (dragRef.current && e.pointerId === dragRef.current.id) {
      // Pan
      const d = dragRef.current
      stateRef.current.ox = d.sox + (e.clientX - d.sx)
      stateRef.current.oy = d.soy + (e.clientY - d.sy)
      draw()
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size < 2) pinchRef.current = null
    if (activePointers.current.size === 0) dragRef.current = null
  }

  // ── Scroll wheel zoom ─────────────────────────────────────────
  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    stateRef.current.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, stateRef.current.scale * (1 + delta)))
    draw()
  }

  // ── Save ──────────────────────────────────────────────────────
  function handleSave() {
    const img = imageRef.current
    if (!img) return

    const off = document.createElement('canvas')
    off.width  = OUTPUT_SIZE
    off.height = OUTPUT_SIZE
    const ctx  = off.getContext('2d')!

    // Circular clip
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    // Scale coords from canvas space to output space
    const ratio = OUTPUT_SIZE / CANVAS_SIZE
    const { scale, ox, oy } = stateRef.current
    const w = img.width  * scale * ratio
    const h = img.height * scale * ratio
    const x = (OUTPUT_SIZE - w) / 2 + ox * ratio
    const y = (OUTPUT_SIZE - h) / 2 + oy * ratio
    ctx.drawImage(img, x, y, w, h)

    off.toBlob(blob => { if (blob) onCrop(blob) }, 'image/jpeg', 0.92)
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true" aria-label="Ajustar foto">
      <div className="cropper-modal">
        <p className="cropper-title">{t('cropper.title')}</p>
        <p className="cropper-hint">{t('cropper.hint')}</p>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="cropper-canvas"
          style={{ cursor: 'grab', touchAction: 'none', opacity: ready ? 1 : 0 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        />

        <div className="cropper-actions">
          <button className="conta-btn-cancel" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button className="conta-btn-save" onClick={handleSave} disabled={!ready}>
            {t('cropper.use')}
          </button>
        </div>
      </div>
    </div>
  )
}

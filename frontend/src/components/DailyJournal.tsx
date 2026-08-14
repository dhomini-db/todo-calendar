import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import { useLanguage } from '../contexts/LanguageContext'

type JournalStore = Record<string, string[]>
type JournalImage = { src: string; flipped?: boolean; x?: number; y?: number; width?: number }
type JournalMedia = { drawing?: string; images?: Array<string | JournalImage> }
type MediaStore = Record<string, JournalMedia>
type TurnDirection = 'next' | 'prev'
type Tool = 'write' | 'highlight' | 'draw' | 'erase'

const STORAGE_KEY = 'taskflow-daily-journal'
const MEDIA_KEY = 'taskflow-daily-journal-media'

function readStore<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T }
  catch { return fallback }
}

function compactImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', .82))
    }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')) }
    image.src = url
  })
}

export default function DailyJournal({ selectedDate }: { selectedDate: Date }) {
  const { lang } = useLanguage()
  const locale = lang === 'en' ? enUS : ptBR
  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const [journal, setJournal] = useState<JournalStore>(() => readStore(STORAGE_KEY, {}))
  const [media, setMedia] = useState<MediaStore>(() => readStore(MEDIA_KEY, {}))
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<TurnDirection | null>(null)
  const [tool, setTool] = useState<Tool>('write')
  const [inkColor, setInkColor] = useState('#ef4444')
  const [strokeSize, setStrokeSize] = useState(3)
  const [showSize, setShowSize] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const imageGestureRef = useRef<{ index: number; mode: 'move' | 'resize'; startX: number; startY: number; x: number; y: number; width: number; containerWidth: number; containerHeight: number } | null>(null)
  const pages = useMemo(() => journal[dateKey] ?? [''], [journal, dateKey])
  const mediaKey = `${dateKey}:${page}`
  const pageMedia = media[mediaKey] ?? {}
  const pageImages = (pageMedia.images ?? []).map(image => typeof image === 'string' ? { src: image, x: 16, y: 18, width: 68 } : { x: 16, y: 18, width: 68, ...image })

  useEffect(() => { setPage(0); setTurn(null); setTool('write'); setSelectedImage(null) }, [dateKey])

  const persist = (nextPages: string[]) => {
    setJournal(current => {
      const next = { ...current, [dateKey]: nextPages }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const persistMedia = (value: JournalMedia) => {
    setMedia(current => {
      const next = { ...current, [mediaKey]: value }
      try { localStorage.setItem(MEDIA_KEY, JSON.stringify(next)) } catch { /* storage full: keep session usable */ }
      return next
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const drawSaved = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * ratio)
      canvas.height = Math.round(rect.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx || !pageMedia.drawing) return
      const image = new Image()
      image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      image.src = pageMedia.drawing
    }
    drawSaved()
    window.addEventListener('resize', drawSaved)
    return () => window.removeEventListener('resize', drawSaved)
  }, [mediaKey])

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (canvas) persistMedia({ ...pageMedia, drawing: canvas.toDataURL('image/png') })
  }

  const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }
  }

  const beginStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx || tool === 'write') return
    drawingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = pointerPosition(event)
    ctx.beginPath(); ctx.moveTo(point.x, point.y)
  }

  const drawStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx) return
    const point = pointerPosition(event)
    const ratio = event.currentTarget.width / event.currentTarget.getBoundingClientRect().width
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over'
    ctx.globalAlpha = tool === 'highlight' ? .16 : 1
    ctx.strokeStyle = inkColor
    ctx.lineWidth = (tool === 'highlight' ? strokeSize * 5 : tool === 'erase' ? strokeSize * 5.5 : strokeSize) * ratio
    ctx.lineTo(point.x, point.y); ctx.stroke()
  }

  const endStroke = () => { if (drawingRef.current) { drawingRef.current = false; const ctx = canvasRef.current?.getContext('2d'); if (ctx) ctx.globalAlpha = 1; saveDrawing() } }

  const addImages = async (files: File[]) => {
    const valid = files.filter(file => file.type.startsWith('image/')).slice(0, Math.max(0, 4 - pageImages.length))
    if (!valid.length) return
    const images = await Promise.all(valid.map(compactImage))
    persistMedia({ ...pageMedia, images: [...pageImages, ...images.map((src, index) => ({ src, x: 12 + index * 4, y: 18 + index * 4, width: 68 }))] })
    setSelectedImage(pageImages.length)
  }

  const updateImage = (index: number, change: Partial<JournalImage>) => {
    const images = pageImages.map((image, item) => item === index ? { ...image, ...change } : image)
    persistMedia({ ...pageMedia, images })
  }

  const beginImageGesture = (event: React.PointerEvent<HTMLElement>, index: number, mode: 'move' | 'resize') => {
    event.preventDefault()
    event.stopPropagation()
    const container = event.currentTarget.closest('.journal-images') as HTMLElement | null
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const image = pageImages[index]
    imageGestureRef.current = { index, mode, startX: event.clientX, startY: event.clientY, x: image.x ?? 16, y: image.y ?? 18, width: image.width ?? 68, containerWidth: bounds.width, containerHeight: bounds.height }
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedImage(index)
  }

  const moveImageGesture = (event: React.PointerEvent<HTMLElement>) => {
    const gesture = imageGestureRef.current
    if (!gesture) return
    event.preventDefault()
    const dx = (event.clientX - gesture.startX) / gesture.containerWidth * 100
    const dy = (event.clientY - gesture.startY) / gesture.containerHeight * 100
    if (gesture.mode === 'resize') {
      updateImage(gesture.index, { width: Math.max(20, Math.min(92, gesture.width + dx)) })
    } else {
      const currentWidth = pageImages[gesture.index]?.width ?? gesture.width
      updateImage(gesture.index, {
        x: Math.max(0, Math.min(100 - currentWidth, gesture.x + dx)),
        y: Math.max(0, Math.min(82, gesture.y + dy)),
      })
    }
  }

  const endImageGesture = (event: React.PointerEvent<HTMLElement>) => {
    if (!imageGestureRef.current) return
    event.preventDefault()
    event.stopPropagation()
    imageGestureRef.current = null
  }

  const changePage = (nextPage: number, direction: TurnDirection) => {
    if (turn || nextPage < 0 || nextPage >= pages.length) return
    setTurn(direction)
    window.setTimeout(() => { setPage(nextPage); setTurn(null); setTool('write'); setSelectedImage(null) }, 330)
  }

  const addPage = () => {
    const nextPages = [...pages, '']
    persist(nextPages); setTurn('next')
    window.setTimeout(() => { setPage(nextPages.length - 1); setTurn(null); setTool('write'); setSelectedImage(null) }, 330)
  }

  const labels = lang === 'en'
    ? { write: 'Write', highlight: 'Highlighter', draw: 'Pen', erase: 'Eraser', color: 'Change color', clear: 'Clear drawing' }
    : { write: 'Escrever', highlight: 'Marca-texto', draw: 'Caneta', erase: 'Borracha', color: 'Mudar cor', clear: 'Limpar desenho' }

  return (
    <section className="daily-journal" aria-label={lang === 'en' ? 'Daily journal' : 'Diário do dia'} onPaste={event => {
      const files = Array.from(event.clipboardData.items).filter(item => item.type.startsWith('image/')).map(item => item.getAsFile()).filter((file): file is File => Boolean(file))
      if (files.length) { event.preventDefault(); void addImages(files) }
    }}>
      <header className="journal-heading">
        <div><span>{lang === 'en' ? 'Your space' : 'Seu espaço'}</span><h3>{lang === 'en' ? 'Daily journal' : 'Diário do dia'}</h3></div>
        <time>{format(selectedDate, lang === 'en' ? 'MMMM d, yyyy' : "d 'de' MMMM 'de' yyyy", { locale })}</time>
      </header>

      <div className="journal-book">
        <div className="journal-rings" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</div>
        <div className={`journal-page ${turn ? `turn-${turn}` : ''}`} onPointerDown={event => {
          const target = event.target as Element
          if (!target.closest('.journal-images figure')) setSelectedImage(null)
        }}>
          <div className="journal-page-top"><strong>{lang === 'en' ? 'Thoughts & ideas' : 'Pensamentos & ideias'}</strong><span>{lang === 'en' ? `Page ${page + 1} of ${pages.length}` : `Página ${page + 1} de ${pages.length}`}</span></div>
          <textarea value={pages[page] ?? ''} onFocus={() => { setTool('write'); setSelectedImage(null) }} onPointerDown={() => { setTool('write'); setSelectedImage(null) }} onChange={event => { const next = [...pages]; next[page] = event.target.value; persist(next) }} placeholder={lang === 'en' ? 'How was your day? Write down a thought, lesson or idea…' : 'Como foi o seu dia? Anote um pensamento, aprendizado ou ideia…'} aria-label={lang === 'en' ? 'Journal notes' : 'Anotações do diário'} />
          {pageImages.length > 0 && <div className="journal-images">{pageImages.map((image, index) => <figure key={`${image.src.slice(-18)}-${index}`} className={selectedImage === index ? 'selected' : ''} style={{ left: `${image.x ?? 16}%`, top: `${image.y ?? 18}%`, width: `${image.width ?? 68}%` }} onPointerDown={event => beginImageGesture(event, index, 'move')} onPointerMove={moveImageGesture} onPointerUp={endImageGesture} onPointerCancel={endImageGesture} onClick={() => { setSelectedImage(index); setTool('write') }}><img src={image.src} className={image.flipped ? 'flipped' : ''} draggable={false} alt={lang === 'en' ? `Journal attachment ${index + 1}` : `Imagem anexada ${index + 1}`} />{selectedImage === index && <><i className="journal-resize-handle handle-nw" onPointerDown={event => beginImageGesture(event, index, 'resize')} /><i className="journal-resize-handle handle-ne" onPointerDown={event => beginImageGesture(event, index, 'resize')} /><i className="journal-resize-handle handle-sw" onPointerDown={event => beginImageGesture(event, index, 'resize')} /><i className="journal-resize-handle handle-se" onPointerDown={event => beginImageGesture(event, index, 'resize')} /><div className="journal-image-tools" role="toolbar" aria-label={lang === 'en' ? 'Image editing' : 'Edição da imagem'} onPointerDown={event => event.stopPropagation()}><button type="button" onClick={event => { event.stopPropagation(); updateImage(index, { flipped: !image.flipped }) }}><span>↔</span>{lang === 'en' ? 'Flip' : 'Inverter'}</button><button type="button" className="remove" onClick={event => { event.stopPropagation(); persistMedia({ ...pageMedia, images: pageImages.filter((_, item) => item !== index) }); setSelectedImage(null) }} aria-label={lang === 'en' ? 'Remove image' : 'Remover imagem'}>×</button></div></>}</figure>)}</div>}
          <canvas ref={canvasRef} className={`journal-canvas tool-${tool}`} onPointerDown={beginStroke} onPointerMove={drawStroke} onPointerUp={endStroke} onPointerCancel={endStroke} />
          <span className="journal-saved">{lang === 'en' ? 'Saved automatically' : 'Salvo automaticamente'}</span>
        </div>
      </div>

      <div className="journal-toolbar" role="toolbar" aria-label={lang === 'en' ? 'Journal tools' : 'Ferramentas do diário'}>
        {(['draw', 'highlight', 'erase'] as Tool[]).map(item => <button key={item} type="button" className={`journal-tool tool-shape-${item} ${tool === item ? 'active' : ''}`} onClick={() => { setTool(current => current === item ? 'write' : item); setShowSize(false) }} title={labels[item]} aria-label={labels[item]} aria-pressed={tool === item}><span className="tool-tip" style={item === 'draw' || item === 'highlight' ? { background: inkColor } : undefined} /><span className="tool-neck" /><span className="tool-body"><i style={item === 'draw' || item === 'highlight' ? { background: inkColor } : undefined} /></span><em>{item === 'highlight' && lang !== 'en' ? <>Marca<br />texto</> : labels[item]}</em></button>)}
        <label className="journal-color" title={labels.color} aria-label={labels.color}><span style={{ background: inkColor }} /><input type="color" value={inkColor} onChange={event => setInkColor(event.target.value)} /><em>{lang === 'en' ? 'Color' : 'Cor'}</em></label>
        <div className="journal-size-wrap">
          <button type="button" className={`journal-size ${showSize ? 'active' : ''}`} onClick={() => setShowSize(value => !value)} aria-label={lang === 'en' ? 'Stroke size' : 'Espessura'} title={lang === 'en' ? 'Stroke size' : 'Espessura'}><span><i style={{ width: `${Math.min(16, 4 + strokeSize * 1.5)}px`, height: `${Math.min(16, 4 + strokeSize * 1.5)}px` }} /></span><em>{lang === 'en' ? 'Size' : 'Tamanho'}</em></button>
          {showSize && <div className="journal-size-popover"><small>{lang === 'en' ? 'Stroke size' : 'Espessura do traço'}</small><input type="range" min="1" max="8" step="1" value={strokeSize} onChange={event => setStrokeSize(Number(event.target.value))} /><b>{strokeSize}</b></div>}
        </div>
        <button type="button" className="journal-clear" onClick={() => { const canvas = canvasRef.current; canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); persistMedia({ ...pageMedia, drawing: undefined }) }} title={labels.clear} aria-label={labels.clear}><span>×</span><em>{lang === 'en' ? 'Clear' : 'Limpar'}</em></button>
      </div>

      <footer className="journal-controls">
        <button type="button" onClick={() => changePage(page - 1, 'prev')} disabled={page === 0 || Boolean(turn)} aria-label={lang === 'en' ? 'Previous page' : 'Folha anterior'}>‹</button>
        <div className="journal-dots">{pages.map((_, index) => <i key={index} className={index === page ? 'active' : ''} />)}</div>
        {page === pages.length - 1 ? <button type="button" className="journal-add" onClick={addPage}>{lang === 'en' ? '+ New page' : '+ Nova folha'}</button> : <button type="button" onClick={() => changePage(page + 1, 'next')} disabled={Boolean(turn)} aria-label={lang === 'en' ? 'Next page' : 'Próxima folha'}>›</button>}
      </footer>
    </section>
  )
}

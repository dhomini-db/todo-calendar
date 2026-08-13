import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import { useLanguage } from '../contexts/LanguageContext'

type JournalStore = Record<string, string[]>
type TurnDirection = 'next' | 'prev'

const STORAGE_KEY = 'taskflow-daily-journal'

function readJournal(): JournalStore {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

export default function DailyJournal({ selectedDate }: { selectedDate: Date }) {
  const { lang } = useLanguage()
  const locale = lang === 'en' ? enUS : ptBR
  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const [journal, setJournal] = useState<JournalStore>(readJournal)
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<TurnDirection | null>(null)
  const pages = useMemo(() => journal[dateKey] ?? [''], [journal, dateKey])

  useEffect(() => { setPage(0); setTurn(null) }, [dateKey])

  const persist = (nextPages: string[]) => {
    setJournal(current => {
      const next = { ...current, [dateKey]: nextPages }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const changePage = (nextPage: number, direction: TurnDirection) => {
    if (turn || nextPage < 0 || nextPage >= pages.length) return
    setTurn(direction)
    window.setTimeout(() => { setPage(nextPage); setTurn(null) }, 330)
  }

  const addPage = () => {
    const nextPages = [...pages, '']
    persist(nextPages)
    setTurn('next')
    window.setTimeout(() => { setPage(nextPages.length - 1); setTurn(null) }, 330)
  }

  return (
    <section className="daily-journal" aria-label={lang === 'en' ? 'Daily journal' : 'Diário do dia'}>
      <header className="journal-heading">
        <div>
          <span>{lang === 'en' ? 'Your space' : 'Seu espaço'}</span>
          <h3>{lang === 'en' ? 'Daily journal' : 'Diário do dia'}</h3>
        </div>
        <time>{format(selectedDate, lang === 'en' ? 'MMMM d, yyyy' : "d 'de' MMMM 'de' yyyy", { locale })}</time>
      </header>

      <div className="journal-book">
        <div className="journal-rings" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</div>
        <div className={`journal-page ${turn ? `turn-${turn}` : ''}`}>
          <div className="journal-page-top">
            <strong>{lang === 'en' ? 'Thoughts & ideas' : 'Pensamentos & ideias'}</strong>
            <span>{lang === 'en' ? `Page ${page + 1} of ${pages.length}` : `Página ${page + 1} de ${pages.length}`}</span>
          </div>
          <textarea
            value={pages[page] ?? ''}
            onChange={event => {
              const next = [...pages]
              next[page] = event.target.value
              persist(next)
            }}
            placeholder={lang === 'en' ? 'How was your day? Write down a thought, lesson or idea…' : 'Como foi o seu dia? Anote um pensamento, aprendizado ou ideia…'}
            aria-label={lang === 'en' ? 'Journal notes' : 'Anotações do diário'}
          />
          <span className="journal-saved">{lang === 'en' ? 'Saved automatically' : 'Salvo automaticamente'}</span>
        </div>
      </div>

      <footer className="journal-controls">
        <button type="button" onClick={() => changePage(page - 1, 'prev')} disabled={page === 0 || Boolean(turn)} aria-label={lang === 'en' ? 'Previous page' : 'Folha anterior'}>‹</button>
        <div className="journal-dots">{pages.map((_, index) => <i key={index} className={index === page ? 'active' : ''} />)}</div>
        {page === pages.length - 1
          ? <button type="button" className="journal-add" onClick={addPage}>{lang === 'en' ? '+ New page' : '+ Nova folha'}</button>
          : <button type="button" onClick={() => changePage(page + 1, 'next')} disabled={Boolean(turn)} aria-label={lang === 'en' ? 'Next page' : 'Próxima folha'}>›</button>}
      </footer>
    </section>
  )
}

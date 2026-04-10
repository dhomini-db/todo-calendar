import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMonthSummary } from '../hooks/useTasks'
import type { DaySummary } from '../types'

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onChangeMonth: (date: Date) => void
}

/** Mapeia a cor da API para as classes CSS do Tailwind */
function colorClass(summary: DaySummary | undefined): string {
  if (!summary || summary.total === 0) return ''
  switch (summary.color) {
    case 'GREEN':       return 'day-green'
    case 'LIGHT_GREEN': return 'day-lightgreen'
    case 'YELLOW':      return 'day-yellow'
    case 'RED':         return 'day-red'
    default:            return ''
  }
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Calendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
}: CalendarProps) {
  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1 // API usa 1-based

  const { data: summary = {} } = useMonthSummary(year, month)

  const firstDay = startOfMonth(currentMonth)
  const lastDay  = endOfMonth(currentMonth)
  const days     = eachDayOfInterval({ start: firstDay, end: lastDay })

  // Quantos dias em branco no início (offset pelo dia da semana)
  const startOffset = getDay(firstDay)

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-lg">
      {/* Cabeçalho: mês e navegação */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition-colors"
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <h2 className="capitalize font-semibold text-white text-lg">
          {monthLabel}
        </h2>

        <button
          onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition-colors"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map(d => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div className="grid grid-cols-7 gap-1">
        {/* Células em branco para o offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const key     = format(day, 'yyyy-MM-dd')
          const daySumm = summary[key]
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDay = isToday(day)
          const hasColor   = daySumm && daySumm.total > 0

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-center
                rounded-xl text-sm font-medium transition-all duration-150
                ${hasColor ? colorClass(daySumm) : 'hover:bg-[#2c2c2c]'}
                ${isSelected ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-[#1e1e1e]' : ''}
                ${isTodayDay && !hasColor ? 'text-violet-400' : 'text-gray-200'}
              `}
              title={
                daySumm
                  ? `${daySumm.completed}/${daySumm.total} tarefas (${daySumm.percentage}%)`
                  : undefined
              }
            >
              {format(day, 'd')}

              {/* Indicador de porcentagem (tooltip visual) */}
              {daySumm && daySumm.total > 0 && (
                <span className="text-[9px] opacity-80 leading-none mt-0.5">
                  {Math.round(daySumm.percentage)}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda de cores */}
      <div className="mt-5 flex flex-wrap gap-3 justify-center text-xs text-gray-500">
        <LegendItem color="bg-green-600/80"      label="100%" />
        <LegendItem color="bg-emerald-500/70"    label="70–99%" />
        <LegendItem color="bg-yellow-500/80"     label="50–69%" />
        <LegendItem color="bg-red-600/80"        label="< 50%" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}

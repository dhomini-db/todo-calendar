export interface TaskMetadata {
  title: string
  startTime?: string
  endTime?: string
}

const TIME_PREFIX = /^\[(\d{2}:\d{2})(?:[–-](\d{2}:\d{2}))?\]\s*/

export function parseTaskMetadata(value: string): TaskMetadata {
  const match = value.match(TIME_PREFIX)
  if (!match) return { title: value }

  return {
    title: value.replace(TIME_PREFIX, '').trim(),
    startTime: match[1],
    endTime: match[2],
  }
}

export function composeTaskTitle(title: string, startTime?: string, endTime?: string) {
  const cleanTitle = title.trim()
  if (!startTime) return cleanTitle
  return `[${startTime}${endTime ? `–${endTime}` : ''}] ${cleanTitle}`
}

export function timeToMinutes(time?: string) {
  if (!time) return Number.MAX_SAFE_INTEGER
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

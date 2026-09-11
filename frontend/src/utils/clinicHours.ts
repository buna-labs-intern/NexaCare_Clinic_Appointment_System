/** Clinic hours: morning 09:00–12:00, lunch 12:00–13:00 blocked, afternoon 13:00–17:00 */

export const CLINIC_MORNING = { start: '09:00', end: '12:00' } as const
export const CLINIC_LUNCH = { start: '12:00', end: '13:00' } as const
export const CLINIC_AFTERNOON = { start: '13:00', end: '17:00' } as const

export const APPOINTMENT_TIME_OPTIONS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
] as const

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function fromMinutes(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function addMinutesToTime(time: string, minutes: number) {
  const [hours, mins] = time.split(':').map(Number)
  return fromMinutes(hours * 60 + mins + minutes)
}

export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DD is today or later (local). */
export function isDateTodayOrFuture(date: string) {
  if (!date) return false
  return date >= todayKey()
}

export function isWithinClinicSession(time: string) {
  const t = toMinutes(time)
  const morning =
    t >= toMinutes(CLINIC_MORNING.start) && t < toMinutes(CLINIC_MORNING.end)
  const afternoon =
    t >= toMinutes(CLINIC_AFTERNOON.start) && t < toMinutes(CLINIC_AFTERNOON.end)
  return morning || afternoon
}

export function crossesLunchBreak(startTime: string, endTime: string) {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const lunchStart = toMinutes(CLINIC_LUNCH.start)
  const lunchEnd = toMinutes(CLINIC_LUNCH.end)
  // overlaps [12:00, 13:00)
  return start < lunchEnd && end > lunchStart
}

export function isSameClinicSession(startTime: string, endTime: string) {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const morningEnd = toMinutes(CLINIC_MORNING.end)
  const afternoonStart = toMinutes(CLINIC_AFTERNOON.start)

  const startMorning = start < morningEnd
  const endMorning = end <= morningEnd
  const startAfternoon = start >= afternoonStart
  const endAfternoon = end > afternoonStart

  return (startMorning && endMorning) || (startAfternoon && endAfternoon)
}

export function isWeekend(date: string) {
  if (!date) return false
  const day = new Date(`${date}T12:00:00`).getDay()
  return day === 0 || day === 6
}

export function isTimeInFutureForDate(date: string, time: string) {
  if (!date || !time) return true
  if (date > todayKey()) return true

  const now = new Date()
  const selected = new Date(`${date}T${time}:00`)
  return selected.getTime() > now.getTime()
}

export function getDefaultAppointmentTimes(durationMinutes = 30) {
  const date = todayKey()
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const nextStart =
    APPOINTMENT_TIME_OPTIONS.find((time) => toMinutes(time) > nowMinutes) ??
    APPOINTMENT_TIME_OPTIONS[0]

  return {
    date,
    startTime: nextStart,
    endTime: addMinutesToTime(nextStart, durationMinutes),
  }
}
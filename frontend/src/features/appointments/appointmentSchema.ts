import { z } from 'zod'
import {
  crossesLunchBreak,
  isDateTodayOrFuture,
  isSameClinicSession,
  isTimeInFutureForDate,
  todayKey,
} from '@/utils/clinicHours'

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function isValidAppointmentStart(time: string) {
  const t = toMinutes(time)
  return (t >= toMinutes('09:00') && t < toMinutes('12:00')) ||
    (t >= toMinutes('13:00') && t < toMinutes('17:00'))
}

function isValidAppointmentEnd(time: string) {
  const t = toMinutes(time)
  return (t > toMinutes('09:00') && t <= toMinutes('12:00')) ||
    (t > toMinutes('13:00') && t <= toMinutes('17:00'))
}

export const appointmentSchema = z
  .object({
    patientId: z.string().min(1, 'Please select a patient'),
    doctorId: z.string().min(1, 'Please select a doctor'),
    serviceId: z.string().min(1, 'Please select a service'),
    date: z
      .string()
      .min(1, 'Please choose an appointment date')
      .refine(isDateTodayOrFuture, {
        message: 'Appointment date cannot be in the past',
      }),
    startTime: z.string().min(1, 'Please choose a start time'),
    endTime: z.string().min(1, 'Please choose an end time'),
    reason: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.startTime || !values.endTime) return

    if (values.endTime <= values.startTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be after start time',
      })
      return
    }

    if (!isValidAppointmentStart(values.startTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['startTime'],
        message: 'Start time must be within clinic hours (09:00–12:00 or 13:00–17:00)',
      })
    }

    if (!isValidAppointmentEnd(values.endTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be within clinic hours (09:00–12:00 or 13:00–17:00)',
      })
    }

    if (crossesLunchBreak(values.startTime, values.endTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'Appointments cannot cross lunch break (12:00–13:00)',
      })
    }

    if (!isSameClinicSession(values.startTime, values.endTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'Start and end must stay in the same session (morning or afternoon)',
      })
    }

    if (values.date === todayKey() && !isTimeInFutureForDate(values.date, values.startTime)) {
      ctx.addIssue({
        code: 'custom',
        path: ['startTime'],
        message: 'Start time must be in the future when booking for today',
      })
    }
  })

export type AppointmentFormValues = z.infer<typeof appointmentSchema>
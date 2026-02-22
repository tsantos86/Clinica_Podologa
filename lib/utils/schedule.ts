/**
 * Utilitários de Lógica de Agenda e Horários
 * Separa a lógica de cálculo das constantes estáticas para evitar problemas de Fast Refresh e TDZ
 */

import { SCHEDULE, CLOSED_DAYS } from '../constants';

/**
 * Converte horário "HH:MM" em minutos desde 00:00
 */
export function timeToMinutes(time: string): number {
    if (!time || !time.includes(':')) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

/**
 * Converte minutos desde 00:00 em "HH:MM"
 */
export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Retorna a configuração de horário para uma determinada data
 */
export function getDaySchedule(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const day = d.getDay();

    let opening: string = SCHEDULE.OPENING_TIME;
    let lastStart: string = SCHEDULE.LAST_START_TIME;
    const closing: string = SCHEDULE.CLOSING_TIME;

    if (day === 6) { // Sábado
        opening = '09:00';
    } else if (day === 2) { // Terça-feira
        lastStart = '15:30';
    }

    return {
        opening,
        lastStart,
        closing,
        isClosed: (CLOSED_DAYS as readonly number[]).includes(day)
    };
}

/**
 * Gera os slots de atendimento baseados na data e no intervalo desejado
 */
export function generateTimeSlots(date?: Date | string, isHourly: boolean = true): string[] {
    const config = getDaySchedule(date || new Date());

    const slots: string[] = [];
    const startMinutes = timeToMinutes(config.opening);
    const endMinutes = timeToMinutes(config.lastStart);

    const interval = isHourly ? 60 : SCHEDULE.SLOT_INTERVAL;

    for (let m = startMinutes; m <= endMinutes; m += interval) {
        slots.push(minutesToTime(m));
    }

    // Garantir que o último horário permitido esteja sempre disponível
    if (isHourly && !slots.includes(config.lastStart)) {
        slots.push(config.lastStart);
    }

    return slots;
}

/**
 * Verifica se um slot é válido para um serviço
 */
export function isSlotAvailable(
    slotTime: string,
    serviceDurationMin: number,
    bookedAppointments: { hora: string; duracaoMinutos?: number }[],
    date?: string | Date
): boolean {
    const slotStart = timeToMinutes(slotTime);
    const totalBlocked = serviceDurationMin + SCHEDULE.HYGIENIZATION_TIME;
    const slotEnd = slotStart + totalBlocked;

    const config = getDaySchedule(date || new Date());
    const closingMinutes = timeToMinutes(config.closing);
    const lastStartMinutes = timeToMinutes(config.lastStart);

    if (slotEnd > closingMinutes) return false;
    if (slotStart > lastStartMinutes) return false;

    for (const appt of bookedAppointments) {
        const apptStart = timeToMinutes(appt.hora);
        const apptDuration = appt.duracaoMinutos || 60;
        const apptEnd = apptStart + (apptDuration + SCHEDULE.HYGIENIZATION_TIME);

        if (slotStart < apptEnd && slotEnd > apptStart) {
            return false;
        }
    }

    return true;
}
/**
 * Converte string de duração ("1h20m", "20min", "2h") em minutos
 */
export function parseDuration(duration?: string): number {
    if (!duration) return 60;
    let total = 0;
    const hMatch = duration.match(/(\d+)\s*h/i);
    const mMatch = duration.match(/(\d+)\s*m/i);
    if (hMatch) total += parseInt(hMatch[1]) * 60;
    if (mMatch) total += parseInt(mMatch[1]);
    return total || 60;
}

/**
 * Calcula o tempo total bloqueado = duração_serviço + higienização
 */
export function getTotalBlockedTime(serviceDurationMinutes: number): number {
    return serviceDurationMinutes + SCHEDULE.HYGIENIZATION_TIME;
}

/** Slots fundamentais (calculados sob demanda ou em runtime estável) */
export const AVAILABLE_TIMES = generateTimeSlots(undefined, false);
export const HOURLY_TIMES = generateTimeSlots(undefined, true);

/** Retorna os slots de hora em hora para uma data específica */
export function getHourlyTimes(date: Date | string): string[] {
    return generateTimeSlots(date, true);
}

/**
 * Utilitários de formatação
 * Funções para formatar datas, moeda, telefone, etc.
 */

import { MONTH_NAMES, DAY_NAMES, VALIDATION, SCHEDULE } from './constants';
import { HOURLY_TIMES, getHourlyTimes } from './utils/schedule';

/**
 * Formata uma data no formato português (ex: "4 de fevereiro de 2026")
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].toLowerCase();
  const year = d.getFullYear();

  return `${day} de ${month} de ${year}`;
}

/**
 * Formata uma data no formato curto (ex: "04/02/2026")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data com dia da semana (ex: "terça-feira, 4 de fevereiro")
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const weekday = DAY_NAMES[d.getDay()].toLowerCase();
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].toLowerCase();

  return `${weekday}, ${day} de ${month}`;
}

/**
 * Converte Date para string YYYY-MM-DD
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converte string YYYY-MM-DD para Date
 */
export function stringToDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Retorna o nome do mês por extenso
 */
export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex];
}

/**
 * Retorna o nome do dia da semana
 */
export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex];
}

/**
 * Formata mês e ano (ex: "fevereiro de 2026")
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const month = MONTH_NAMES[d.getMonth()].toLowerCase();
  const year = d.getFullYear();

  return `${month} de ${year}`;
}

/**
 * Formata valor monetário em euros (ex: "€30,00")
 */
export function formatCurrency(value: number): string {
  return `€${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata número de telefone português (ex: "912 345 678")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Remove formatação de telefone (ex: "912 345 678" -> "912345678")
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida número de telefone português
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = unformatPhone(phone);
  return /^[0-9]{9}$/.test(cleaned);
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida se é um horário permitido
 */
export function isValidHourlyTime(time: string): boolean {
  // Verifica se o horário está na lista padrão (08:30...) ou na de Sábado (09:00...)
  const weekdaySlots = HOURLY_TIMES;
  const saturdaySlots = getHourlyTimes('2026-02-14'); // Qualquer sábado para teste de geração

  return weekdaySlots.includes(time) || saturdaySlots.includes(time);
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Trunca texto longo (ex: "Texto muito..." até maxLength)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formata horário (ex: "09:00" -> "09h00")
 */
export function formatTime(time: string): string {
  return time.replace(':', 'h');
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? stringToDate(date) : date;
  const today = new Date();

  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

/**
 * Verifica se uma data é no passado
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? stringToDate(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return d < today;
}

/**
 * Verifica se uma data é no futuro
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? stringToDate(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return d > today;
}

/**
 * Retorna saudação baseada na hora do dia
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Bom dia';
  if (hour < 19) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Formata tamanho de arquivo (ex: 1024 -> "1 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gera iniciais do nome (ex: "Maria Silva" -> "MS")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formata duração em minutos (ex: 90 -> "1h 30min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Remove acentos de uma string
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Cria slug a partir de texto (ex: "Terapia Podal" -> "terapia-podal")
 */
export function createSlug(text: string): string {
  return removeAccents(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

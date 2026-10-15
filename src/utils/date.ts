/**
 * Date utility functions for local calendar dates (YYYY-MM-DD)
 * Prevents timezone offset shifts.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function isToday(dateString: string): boolean {
  return dateString === getLocalDateString();
}

export function isOverdue(dateString: string): boolean {
  const today = getLocalDateString();
  return dateString < today;
}

export function isUpcoming(dateString: string): boolean {
  const today = getLocalDateString();
  return dateString > today;
}

export function compareDates(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return '';
  const today = getLocalDateString();

  const todayDate = parseLocalDate(today);
  const targetDate = parseLocalDate(dateString);
  const diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (targetDate.getFullYear() !== todayDate.getFullYear()) {
    options.year = 'numeric';
  }

  return targetDate.toLocaleDateString(undefined, options);
}

export function getNowIsoString(): string {
  return new Date().toISOString();
}

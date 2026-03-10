import { format } from 'date-fns';

export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'PPP',
  fallback: string = ''
): string {
  if (!date) return fallback;
  try {
    return format(new Date(date), formatStr);
  } catch {
    return fallback;
  }
}
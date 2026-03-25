/** European meteorological seasons (Northern Hemisphere). */
export type MeteorologicalSeason = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

/**
 * Spring: Mar 1 – May 31 · Summer: Jun 1 – Aug 31 · Autumn: Sep 1 – Nov 30 · Winter: Dec 1 – Feb 29
 * Uses UTC month/day so the rule is stable regardless of server TZ.
 */
export function meteorologicalSeasonFromDate(d: Date): MeteorologicalSeason {
  const m = d.getUTCMonth() + 1;
  if (m === 12 || m === 1 || m === 2) return 'WINTER';
  if (m >= 3 && m <= 5) return 'SPRING';
  if (m >= 6 && m <= 8) return 'SUMMER';
  return 'AUTUMN';
}

export function parseDepartureDateUtc(isoDate: string): Date {
  const [y, mo, day] = isoDate.split('-').map((p) => parseInt(p, 10));
  return new Date(Date.UTC(y, mo - 1, day));
}

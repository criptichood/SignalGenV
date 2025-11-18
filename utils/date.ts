
export function formatDistanceToNow(date: number | Date): string {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.round((now.getTime() - d.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.44);
    const years = Math.round(days / 365.25);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
}

/**
 * Parses a duration string (e.g., "5m - 10m", "1hr") and returns the maximum duration in milliseconds.
 * Returns null if the duration is indefinite (e.g., "Any time frame").
 * @param durationStr The string representation of the duration.
 * @returns The maximum duration in milliseconds, or null.
 */
export function parseDurationToMillis(durationStr: string): number | null {
  if (!durationStr || durationStr.toLowerCase() === 'any time frame') {
    return null;
  }

  // This regex finds numbers followed by 'm' or 'hr' (case-insensitive)
  const matches = durationStr.match(/(\d+)\s*(m|hr)/gi);

  if (!matches) {
    return null;
  }

  const durationsInMillis = matches.map(match => {
    const value = parseInt(match, 10);
    if (match.toLowerCase().includes('hr')) {
      return value * 60 * 60 * 1000;
    }
    if (match.toLowerCase().includes('m')) {
      return value * 60 * 1000;
    }
    return 0;
  });

  if (durationsInMillis.length === 0) {
    return null;
  }

  return Math.max(...durationsInMillis);
}

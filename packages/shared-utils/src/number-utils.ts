export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function roundToDecimals(value: number, decimals = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculates payout strictly matching to minute-level.
 * @param timeLogged format "HH:MM", e.g. "04:20" or "00:03"
 * @param hourlyRate e.g. 2000
 * @returns payout rounded to exactly 2 decimal places.
 */
export function calculatePayout(timeLogged: string, hourlyRate: number): number {
  if (!timeLogged || !timeLogged.includes(':')) return 0;
  
  const parts = timeLogged.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  // Drill down to the exact minute level
  const totalMinutes = hours * 60 + minutes;
  const payout = totalMinutes * (hourlyRate / 60);
  
  // Return rounded to exactly 2 decimal places as a number
  return Number(payout.toFixed(2));
}

export type Currency = 'XAF' | 'EUR' | 'USD';
export const currencies: Currency[] = ['XAF', 'EUR', 'USD'];
export function hasPublishedPrices(rows: { price_minor: number | null }[]) {
  return rows.some(row => row.price_minor !== null && Number.isFinite(row.price_minor) && row.price_minor >= 0);
}
export function hasPublishedCollection(rows: { status: string }[]) {
  return rows.some(row => row.status === 'published');
}
export function convertPrice(minor: number, from: string, to: Currency, usdPerEuro: number | null) {
  if (from === to) return minor / 100;
  const eur = from === 'EUR' ? minor / 100 : from === 'XAF' ? minor / 100 / 655.957 : from === 'USD' && usdPerEuro ? minor / 100 / usdPerEuro : null;
  if (eur === null) return null;
  return to === 'EUR' ? eur : to === 'XAF' ? eur * 655.957 : usdPerEuro ? eur * usdPerEuro : null;
}
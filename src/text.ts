export const RE_CV = /\(CV[:.]\s*(.+?)\)/g

export function extractCVs(artist: string): string {
  return [...artist.matchAll(new RegExp(RE_CV))].map(([, cv]) => cv).join('/')
}

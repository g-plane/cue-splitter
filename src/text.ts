import type { CueSheet, Track } from '@gplane/cue'

const RE_PLACEHOLDER = /%(\w+)%/g

export function formatFileName(track: Track, format: string, cue: CueSheet) {
  const maxLength = Math.max(
    ...cue.files[0]!.tracks.map(({ trackNumber }) => trackNumber)
  ).toString().length
  const data: Record<string, string> = {
    title: track.title ?? '',
    artist: track.performer ?? '',
    album: cue.title ?? '',
    albumartist: cue.performer ?? '',
    track: track.trackNumber.toString(),
    paddedtrack: track.trackNumber.toString().padStart(maxLength, '0'),
  }

  return (
    format.replace(
      RE_PLACEHOLDER,
      (_, key: string) => data[key.toLowerCase()] ?? ''
    ) + '.flac'
  )
}

export const RE_CV = /\(CV[:.：]\s*(.+?)\)/g

export function extractCVs(artist: string): string {
  return [...artist.matchAll(new RegExp(RE_CV))].map(([, cv]) => cv).join('/')
}

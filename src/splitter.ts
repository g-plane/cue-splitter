import { parse, type CueSheet, type Track } from '@gplane/cue'
import { flac } from 'flac.wasm'
import produce from 'immer'
import { create } from 'zustand'

interface SplitterState {
  audioFile: Uint8Array | null
  updateAudioFile: (file: Uint8Array) => void
  cue: CueSheet | null
  loadCueSheet: (content: string) => void
  frontCover: Uint8Array | null
  frontCoverFileName: string
  updateFrontCover: (picture: Uint8Array, fileName: string) => void
  fileNameFormat: string
  setFileNameFormat: (format: string) => void
  updateTrack: (track: Track) => void
}

export const useSplitterStore = create<SplitterState>()((set) => ({
  audioFile: null,
  audioFileName: '',
  updateAudioFile: (file: Uint8Array) => {
    set({ audioFile: file })
  },
  cue: null,
  loadCueSheet: (content: string) => {
    const { sheet } = parse(content, { fatal: true })
    set({ cue: sheet })
  },
  frontCover: null,
  frontCoverFileName: '',
  updateFrontCover: (picture: Uint8Array, fileName: string) => {
    set({ frontCover: picture, frontCoverFileName: fileName })
  },
  fileNameFormat: '%artist% - %title%',
  setFileNameFormat: (format: string) => {
    set({ fileNameFormat: format })
  },
  updateTrack: (track: Track) => {
    set(
      produce<SplitterState>((state) => {
        const tracks = state.cue!.files[0]!.tracks
        const index = tracks.findIndex(
          ({ trackNumber }) => trackNumber === track.trackNumber
        )
        if (index >= 0) {
          tracks[index] = track
        }
      })
    )
  },
}))

export async function splitAudio({
  audioFile,
  cue,
  track,
  frontCover,
  frontCoverFileName,
}: {
  audioFile: Uint8Array
  cue: CueSheet
  track: Track
  frontCover: Uint8Array | null
  frontCoverFileName: string
}) {
  const args: string[] = []

  const start = track.indexes.find((index) => index.number === 1)?.startingTime
  if (start) {
    args.push(`--skip=${start[0]}:${start[1]}.${start[2]}`)
  }

  const nextTrack = cue.files[0]?.tracks.find(
    ({ trackNumber }) => track.trackNumber + 1 === trackNumber
  )
  const end = nextTrack?.indexes.find(
    (index) => index.number === 1
  )?.startingTime
  if (end) {
    args.push(`--until=${end[0]}:${end[1]}.${end[2]}`)
  }

  if (track.title) {
    args.push(`--tag=TITLE=${track.title}`)
  }
  if (track.performer) {
    args.push(`--tag=ARTIST=${track.performer}`)
  }
  if (cue.title) {
    args.push(`--tag=ALBUM=${cue.title}`)
  }
  if (cue.performer) {
    args.push(`--tag=ALBUMARTIST=${cue.performer}`)
    args.push(`--tag=ALBUM ARTIST=${cue.performer}`)
  }
  args.push(`--tag=TRACKNUMBER=${track.trackNumber}`)
  if (frontCover && frontCoverFileName) {
    args.push(`--picture=${frontCoverFileName}`)
  }

  const inputFileName = 'input.flac'
  const outputFileName = 'output.flac'

  args.push('-o', outputFileName)
  args.push(inputFileName)

  const inputFiles = new Map([[inputFileName, audioFile]])
  if (frontCover && frontCoverFileName) {
    inputFiles.set(frontCoverFileName, frontCover)
  }

  const { exitCode, stdout, stderr, files } = await flac(args, {
    inputFiles,
    outputFileNames: [outputFileName],
  })

  if (exitCode === 0) {
    return files.get(outputFileName)
  } else {
    console.error(`stdout ------------${stdout}\nstderr ------------${stderr}`)
    throw new Error('Failed to encode FLAC.')
  }
}

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

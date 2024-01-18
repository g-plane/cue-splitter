import { type CueSheet, type Track, parse } from '@gplane/cue'
import { flac } from 'flac.wasm'
import produce from 'immer'
import { create } from 'zustand'

export interface FrontCover {
  file: Blob
  blobURL: string
  name: string
  width: number
  height: number
}

interface SplitterState {
  audioFile: Blob | null
  updateAudioFile: (file: Blob) => void
  cue: CueSheet | null
  loadCueSheet: (content: string) => void
  updateAlbum: (album: string) => void
  updateAlbumArtist: (albumArtist: string) => void
  frontCover: FrontCover | null
  updateFrontCover: (picture: Blob, name?: string) => Promise<void>
  fileNameFormat: string
  setFileNameFormat: (format: string) => void
  updateTrack: (track: Track) => void
}

export const useSplitterStore = create<SplitterState>()((set, get) => ({
  audioFile: null,
  audioFileName: '',
  updateAudioFile: (file: Blob) => {
    set({ audioFile: file })
  },
  cue: null,
  loadCueSheet: (content: string) => {
    const { sheet } = parse(content, { fatal: true })
    set({ cue: sheet })
  },
  updateAlbum: (album: string) => {
    set((state) => (state.cue ? { cue: { ...state.cue, title: album } } : {}))
  },
  updateAlbumArtist: (albumArtist: string) => {
    set((state) => state.cue ? { cue: { ...state.cue, performer: albumArtist } } : {})
  },
  frontCover: null,
  updateFrontCover: async (picture: Blob, name?: string) => {
    const previous = get().frontCover
    if (previous) {
      URL.revokeObjectURL(previous.blobURL)
    }
    const { width, height } = await createImageBitmap(picture)
    set((state) => ({
      frontCover: {
        file: picture,
        blobURL: URL.createObjectURL(picture),
        name: name ?? state.frontCover?.name ?? '',
        width,
        height,
      },
    }))
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
}: {
  audioFile: Blob,
  cue: CueSheet,
  track: Track,
  frontCover: FrontCover | null,
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
  const date = cue.comments.find((comment) => comment.startsWith('DATE '))
  if (date) {
    args.push(`--tag=DATE=${date.slice(5)}`)
  }
  const genre = cue.comments.find((comment) => comment.startsWith('GENRE '))
  if (genre) {
    args.push(`--tag=GENRE=${genre.slice(6)}`)
  }

  if (frontCover) {
    args.push(`--picture=${frontCover.name}`)
  }

  const inputFileName = 'input.flac'
  const outputFileName = 'output.flac'

  args.push('-o', outputFileName)
  args.push(inputFileName)

  const inputFiles = new Map([
    [inputFileName, new Uint8Array(await audioFile.arrayBuffer())],
  ])
  if (frontCover) {
    inputFiles.set(
      frontCover.name,
      new Uint8Array(await frontCover.file.arrayBuffer())
    )
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

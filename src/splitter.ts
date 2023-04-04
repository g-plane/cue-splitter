import { parse, type CueSheet, type Track } from '@gplane/cue'
import { flac } from 'flac.wasm'
import produce from 'immer'
import { create } from 'zustand'

interface SplitterState {
  audioFile: Blob | null
  updateAudioFile: (file: Blob) => void
  cue: CueSheet | null
  loadCueSheet: (content: string) => void
  updateAlbum: (album: string) => void
  updateAlbumArtist: (albumArtist: string) => void
  frontCover: Blob | null
  frontCoverBlobURL: string
  frontCoverFileName: string
  updateFrontCover: (picture: Blob, fileName: string) => void
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
    set((state) =>
      state.cue ? { cue: { ...state.cue, performer: albumArtist } } : {}
    )
  },
  frontCover: null,
  frontCoverBlobURL: '',
  frontCoverFileName: '',
  updateFrontCover: (picture: Blob, fileName: string) => {
    URL.revokeObjectURL(get().frontCoverBlobURL)
    set({
      frontCover: picture,
      frontCoverBlobURL: URL.createObjectURL(picture),
      frontCoverFileName: fileName,
    })
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
  audioFile: Blob
  cue: CueSheet
  track: Track
  frontCover: Blob | null
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

  const inputFiles = new Map([
    [inputFileName, new Uint8Array(await audioFile.arrayBuffer())],
  ])
  if (frontCover && frontCoverFileName) {
    inputFiles.set(
      frontCoverFileName,
      new Uint8Array(await frontCover.arrayBuffer())
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

import type { CueSheet, Track } from '@gplane/cue'
import { splitAudio } from './splitter'
import { formatFileName } from './text'

export async function saveMultipleToFolder({
  tracks,
  audioFile,
  fileNameFormat,
  cue,
  frontCover,
  frontCoverFileName,
}: {
  tracks: Track[]
  audioFile: Uint8Array
  fileNameFormat: string
  cue: CueSheet
  frontCover: Uint8Array | null
  frontCoverFileName: string
}) {
  const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })

  await Promise.all(
    tracks.map(async (track) => {
      const file = await splitAudio({
        audioFile,
        cue,
        track,
        frontCover,
        frontCoverFileName,
      })
      if (!file) {
        return
      }

      const fileHandle = await dirHandle.getFileHandle(
        formatFileName(track, fileNameFormat, cue).replaceAll('/', ','),
        { create: true }
      )
      const stream = await fileHandle.createWritable()
      await stream.write(file)
      await stream.close()
    })
  )
}

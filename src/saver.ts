import type { CueSheet, Track } from '@gplane/cue'
import { Zip, ZipPassThrough } from 'fflate'
import { splitAudio } from './splitter'
import { formatFileName } from './text'

export async function saveSingle({
  track,
  audioFile,
  fileNameFormat,
  cue,
  frontCover,
  frontCoverFileName,
}: {
  track: Track
  audioFile: Uint8Array
  fileNameFormat: string
  cue: CueSheet
  frontCover: Uint8Array | null
  frontCoverFileName: string
}) {
  const file = await splitAudio({
    audioFile,
    cue,
    track,
    frontCover,
    frontCoverFileName,
  })
  if (!file) {
    throw new Error("FLAC file isn't encoded successfully.")
  }

  const url = URL.createObjectURL(new Blob([file]))
  const link = document.createElement('a')
  link.href = url
  link.download = formatFileName(track, fileNameFormat, cue).replaceAll(
    '/',
    ','
  )
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

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

export async function saveMultipleAsZip({
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
  const chunks = await new Promise<Uint8Array[]>(async (resolve, reject) => {
    const chunks: Uint8Array[] = []
    const zip = new Zip((error, data, final) => {
      if (error) {
        reject(error)
        return
      }

      chunks.push(data)
      if (final) {
        resolve(chunks)
      }
    })

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

        const zipItem = new ZipPassThrough(
          formatFileName(track, fileNameFormat, cue).replaceAll('/', ',')
        )
        zip.add(zipItem)
        zipItem.push(file, true)
      })
    )
    zip.end()
  })

  const url = URL.createObjectURL(new Blob(chunks))
  const link = document.createElement('a')
  link.href = url
  link.download = 'tracks.zip'
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

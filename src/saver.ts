import type { CueSheet, Track } from '@gplane/cue'
import { Zip, ZipPassThrough } from 'fflate'
import { type FrontCover, splitAudio } from './splitter'
import { formatFileName } from './text'

export async function saveSingle({
  track,
  audioFile,
  fileNameFormat,
  cue,
  frontCover,
}: {
  track: Track,
  audioFile: Blob,
  fileNameFormat: string,
  cue: CueSheet,
  frontCover: FrontCover | null,
}) {
  const file = await splitAudio({
    audioFile,
    cue,
    track,
    frontCover,
  })
  if (!file) {
    throw new Error("FLAC file isn't encoded successfully.")
  }

  const url = URL.createObjectURL(new Blob([file]))
  const link = document.createElement('a')
  link.href = url
  link.download = normalizeFileName(formatFileName(track, fileNameFormat, cue))
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
}: {
  tracks: Track[],
  audioFile: Blob,
  fileNameFormat: string,
  cue: CueSheet,
  frontCover: FrontCover | null,
}) {
  const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })

  await Promise.all(
    tracks.map(async (track) => {
      const file = await splitAudio({
        audioFile,
        cue,
        track,
        frontCover,
      })
      if (!file) {
        return
      }

      const fileHandle = await dirHandle.getFileHandle(
        normalizeFileName(formatFileName(track, fileNameFormat, cue)),
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
  topLevelFolder,
}: {
  tracks: Track[],
  audioFile: Blob,
  fileNameFormat: string,
  cue: CueSheet,
  frontCover: FrontCover | null,
  topLevelFolder: boolean,
}) {
  const folderName = normalizeFileName(cue.title ?? 'tracks')

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
        })
        if (!file) {
          return
        }

        const zipItem = new ZipPassThrough(
          (topLevelFolder ? folderName + '/' : '') +
            normalizeFileName(formatFileName(track, fileNameFormat, cue))
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
  link.download = `${folderName}.zip`
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function normalizeFileName(fileName: string) {
  return fileName.replaceAll('/', ',')
}

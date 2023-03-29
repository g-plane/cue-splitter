import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
} from '@fluentui/react-components'
import { SaveRegular } from '@fluentui/react-icons'
import type { Track } from '@gplane/cue'
import { toast } from 'react-toastify'
import { formatFileName, splitAudio, useSplitterStore } from './splitter'
import ArtistEditDialog from './ArtistEditDialog'

const useStyles = makeStyles({
  trackNumberColumn: {
    width: '100px',
  },
  operationsColumn: {
    width: '120px',
  },
})

export default function TrackList() {
  const classes = useStyles()

  const audioFile = useSplitterStore((state) => state.audioFile)
  const frontCover = useSplitterStore((state) => state.frontCover)
  const frontCoverFileName = useSplitterStore(
    (state) => state.frontCoverFileName
  )
  const cue = useSplitterStore((state) => state.cue)
  const fileNameFormat = useSplitterStore((state) => state.fileNameFormat)
  const firstFile = cue?.files[0]

  async function handleSave(track: Track) {
    if (!audioFile || !cue) {
      return
    }

    let file
    try {
      file = await splitAudio({
        audioFile,
        cue,
        track,
        frontCover,
        frontCoverFileName,
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, { type: 'error' })
      }
    }
    if (!file) {
      return
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Album</TableHeaderCell>
          <TableHeaderCell>Artist</TableHeaderCell>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell className={classes.trackNumberColumn}>
            Track Number
          </TableHeaderCell>
          <TableHeaderCell className={classes.operationsColumn}>
            Operations
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {firstFile &&
          firstFile.tracks.map((track) => (
            <TableRow key={track.trackNumber}>
              <TableCell>
                <TableCellLayout>{cue.title}</TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>{track.performer}</TableCellLayout>
                <TableCellActions>
                  <ArtistEditDialog track={track} />
                </TableCellActions>
              </TableCell>
              <TableCell>
                <TableCellLayout>{track.title}</TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout className={classes.trackNumberColumn}>
                  {track.trackNumber}
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>
                  <Button
                    appearance="primary"
                    icon={<SaveRegular />}
                    disabled={!audioFile}
                    onClick={() => handleSave(track)}
                  >
                    Save
                  </Button>
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}

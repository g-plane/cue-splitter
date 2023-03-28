import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
} from '@fluentui/react-components'
import { ArrowDownRegular } from '@fluentui/react-icons'
import type { Track } from '@gplane/cue'
import { splitAudio, useSplitterStore } from './splitter'

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
  const firstFile = cue?.files[0]

  async function handleDownload(track: Track) {
    if (!audioFile || !cue) {
      return
    }

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

    const url = URL.createObjectURL(new Blob([file]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'output.flac'
    link.click()
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
                    icon={<ArrowDownRegular />}
                    disabled={!audioFile}
                    onClick={() => handleDownload(track)}
                  >
                    Download
                  </Button>
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}

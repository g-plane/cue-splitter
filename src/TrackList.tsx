import {
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
} from '@fluentui/react-components'
import { useSplitterStore } from './splitter'

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

  const cue = useSplitterStore((state) => state.cue)
  const firstFile = cue?.files[0]

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
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}

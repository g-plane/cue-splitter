import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  makeStyles,
  type TableColumnDefinition,
  createTableColumn,
  useTableFeatures,
  useTableSelection,
} from '@fluentui/react-components'
import { SaveRegular } from '@fluentui/react-icons'
import type { Track } from '@gplane/cue'
import { toast } from 'react-toastify'
import { useSplitterStore } from './splitter'
import TrackEditDialog from './TrackEditDialog'
import { saveMultipleToFolder, saveSingle } from './saver'

const IS_FS_ACCESS_SUPPORTED = 'showDirectoryPicker' in window

interface Props {
  selectedTracks: Set<number>
  onSelectedTracksChange(selectedTracks: Set<number>): void
}

const columns: TableColumnDefinition<Track>[] = [
  createTableColumn({ columnId: 'album' }),
  createTableColumn({ columnId: 'artist' }),
  createTableColumn({ columnId: 'title' }),
  createTableColumn({ columnId: 'trackNumber' }),
]

const useStyles = makeStyles({
  trackNumberColumn: {
    width: '100px',
  },
  operationsColumn: {
    width: '200px',
  },
  operationBtns: {
    display: 'flex',
    columnGap: '8px',
  },
  batchOperationBtns: {
    marginTop: '8px',
    display: 'flex',
    columnGap: '8px',
  },
})

export default function TrackList({
  selectedTracks,
  onSelectedTracksChange,
}: Props) {
  const classes = useStyles()

  const audioFile = useSplitterStore((state) => state.audioFile)
  const frontCover = useSplitterStore((state) => state.frontCover)
  const frontCoverFileName = useSplitterStore(
    (state) => state.frontCoverFileName
  )
  const cue = useSplitterStore((state) => state.cue)
  const fileNameFormat = useSplitterStore((state) => state.fileNameFormat)

  const firstFile = cue?.files[0]

  const {
    selection: {
      allRowsSelected,
      someRowsSelected,
      isRowSelected,
      toggleRow,
      toggleAllRows,
    },
  } = useTableFeatures(
    {
      columns,
      items: firstFile?.tracks ?? [],
      getRowId: ({ trackNumber }) => trackNumber,
    },
    [
      useTableSelection({
        selectionMode: 'multiselect',
        selectedItems: selectedTracks,
        onSelectionChange: (_, { selectedItems }) =>
          onSelectedTracksChange(selectedItems as Set<number>),
      }),
    ]
  )

  async function handleSave(track: Track) {
    if (!audioFile || !cue) {
      return
    }

    try {
      await saveSingle({
        audioFile,
        track,
        fileNameFormat,
        cue,
        frontCover,
        frontCoverFileName,
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, { type: 'error' })
      }
    }
  }

  async function handleSaveToFolder() {
    if (!audioFile || !firstFile) {
      return
    }

    try {
      await saveMultipleToFolder({
        audioFile,
        tracks: firstFile.tracks.filter(({ trackNumber }) =>
          isRowSelected(trackNumber)
        ),
        fileNameFormat,
        cue,
        frontCover,
        frontCoverFileName,
      })
      toast('Saved.', { type: 'success' })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, { type: 'error' })
      }
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableSelectionCell
              checked={
                allRowsSelected ? true : someRowsSelected ? 'mixed' : false
              }
              onClick={toggleAllRows}
            />
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
                <TableSelectionCell
                  checked={isRowSelected(track.trackNumber)}
                  onClick={(event) => toggleRow(event, track.trackNumber)}
                />
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
                    <div className={classes.operationBtns}>
                      <Button
                        appearance="primary"
                        icon={<SaveRegular />}
                        disabled={!audioFile}
                        onClick={() => handleSave(track)}
                      >
                        Save
                      </Button>
                      <TrackEditDialog track={track} />
                    </div>
                  </TableCellLayout>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className={classes.batchOperationBtns}>
        {IS_FS_ACCESS_SUPPORTED && (
          <Button
            appearance="primary"
            disabled={!someRowsSelected || !audioFile}
            onClick={handleSaveToFolder}
          >
            Save selected to local folder
          </Button>
        )}
        <Button appearance="primary" disabled={!someRowsSelected || !audioFile}>
          Save selected as a ZIP package
        </Button>
      </div>
    </div>
  )
}

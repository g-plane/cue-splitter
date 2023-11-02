import {
  FluentProvider,
  makeStyles,
  webLightTheme,
} from '@fluentui/react-components'
import { useState } from 'react'
import FileNameFormatCombo from './FileNameFormatCombo'
import SourceInput from './SourceInput'
import TrackList from './TrackList'

const useStyles = makeStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
})

export default function App() {
  const classes = useStyles()
  const [selectedTracks, setSelectedTracks] = useState(new Set<number>())

  return (
    <FluentProvider theme={webLightTheme} className={classes.app}>
      <SourceInput onCueSheetFileChange={() => setSelectedTracks(new Set())} />
      <FileNameFormatCombo />
      <TrackList
        selectedTracks={selectedTracks}
        onSelectedTracksChange={setSelectedTracks}
      />
    </FluentProvider>
  )
}

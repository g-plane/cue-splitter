import {
  FluentProvider,
  makeStyles,
  webLightTheme,
} from '@fluentui/react-components'
import SourceInput from './SourceInput'
import TrackList from './TrackList'
import FileNameFormatCombo from './FileNameFormatCombo'

const useStyles = makeStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
})

export default function App() {
  const classes = useStyles()

  return (
    <FluentProvider theme={webLightTheme} className={classes.app}>
      <SourceInput />
      <FileNameFormatCombo />
      <TrackList />
    </FluentProvider>
  )
}

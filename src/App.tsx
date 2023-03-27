import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import SourceInput from './SourceInput'
import TrackList from './TrackList'

export default function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <SourceInput />
      <TrackList />
    </FluentProvider>
  )
}

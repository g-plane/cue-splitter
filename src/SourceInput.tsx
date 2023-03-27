import { Button, Label, Text, makeStyles } from '@fluentui/react-components'
import {
  AppsList24Regular,
  Image24Regular,
  MusicNote224Regular,
} from '@fluentui/react-icons'
import { useState } from 'react'
import { useSplitterStore } from './splitter'

const useStyles = makeStyles({
  hidden: {
    display: 'none',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  frontCoverFormItem: {
    display: 'flex',
    '& img': {
      marginLeft: '8px',
    },
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '2px',
    },
  },
})

export default function SourceInput() {
  const classes = useStyles()
  const audioFileName = useSplitterStore((state) => state.audioFileName)
  const updateAudioFile = useSplitterStore((state) => state.updateAudioFile)
  const [cueSheetFileName, setCueSheetFileName] = useState('')
  const loadCueSheet = useSplitterStore((state) => state.loadCueSheet)
  const frontCoverFileName = useSplitterStore(
    (state) => state.frontCoverFileName
  )
  const [frontCoverBlobURL, setFrontCoverBlobURL] = useState('')
  const updateFrontCover = useSplitterStore((state) => state.updateFrontCover)

  async function handleAudioFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.currentTarget.files?.[0]
    if (file) {
      updateAudioFile(new Uint8Array(await file.arrayBuffer()), file.name)
    }
  }

  async function handleCueSheetChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.currentTarget.files?.[0]
    if (file) {
      loadCueSheet(await file.text())
      setCueSheetFileName(file.name)
    }
  }

  async function handleFrontCoverChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    URL.revokeObjectURL(frontCoverBlobURL)

    const file = event.currentTarget.files?.[0]
    if (file) {
      updateFrontCover(new Uint8Array(await file.arrayBuffer()), file.name)
      setFrontCoverBlobURL(URL.createObjectURL(file))
    }
  }

  return (
    <div className={classes.layout}>
      <div className={classes.formItem}>
        <Label className={classes.formLabel} weight="semibold" size="large">
          <MusicNote224Regular />
          Audio File
        </Label>
        <Text italic={!audioFileName}>{audioFileName || 'Please choose.'}</Text>
        <label>
          <input
            className={classes.hidden}
            type="file"
            accept="audio/*"
            onChange={handleAudioFileChange}
          />
          <Button as="a">Choose audio file...</Button>
        </label>
      </div>
      <div className={classes.formItem}>
        <Label className={classes.formLabel} weight="semibold" size="large">
          <AppsList24Regular />
          Cue Sheet
        </Label>
        <Text italic={!cueSheetFileName}>
          {cueSheetFileName || 'Please choose.'}
        </Text>
        <label>
          <input
            className={classes.hidden}
            type="file"
            accept=".cue"
            onChange={handleCueSheetChange}
          />
          <Button as="a">Choose Cue Sheet...</Button>
        </label>
      </div>
      <div className={classes.frontCoverFormItem}>
        <div className={classes.formItem}>
          <Label className={classes.formLabel} weight="semibold" size="large">
            <Image24Regular />
            Front Cover Picture
          </Label>
          <Text italic={!frontCoverFileName}>
            {frontCoverFileName || 'Please choose.'}
          </Text>
          <label>
            <input
              className={classes.hidden}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFrontCoverChange}
            />
            <Button as="a">Choose front cover picture...</Button>
          </label>
        </div>
        {frontCoverBlobURL && (
          <img src={frontCoverBlobURL} alt="Front Cover" height={75} />
        )}
      </div>
    </div>
  )
}

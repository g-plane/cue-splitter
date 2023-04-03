import { Button, Label, Text, makeStyles } from '@fluentui/react-components'
import {
  AppsList24Regular,
  Image24Regular,
  MusicNote224Regular,
} from '@fluentui/react-icons'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSplitterStore } from './splitter'
import { calcImageSize } from './image'

interface Props {
  onCueSheetFileChange(): void
}

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
    columnGap: '8px',
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '2px',
    },
  },
})

export default function SourceInput({ onCueSheetFileChange }: Props) {
  const classes = useStyles()
  const [audioFileName, setAudioFileName] = useState('')
  const updateAudioFile = useSplitterStore((state) => state.updateAudioFile)
  const [cueSheetFileName, setCueSheetFileName] = useState('')
  const loadCueSheet = useSplitterStore((state) => state.loadCueSheet)
  const frontCoverFileName = useSplitterStore(
    (state) => state.frontCoverFileName
  )
  const [frontCoverBlobURL, setFrontCoverBlobURL] = useState('')
  const updateFrontCover = useSplitterStore((state) => state.updateFrontCover)
  const [frontCoverSize, setFrontCoverSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function preventNavigation(event: DragEvent) {
      event.preventDefault()
    }

    async function handler(event: DragEvent) {
      event.preventDefault()
      if (!event.dataTransfer) {
        return
      }
      const files = [...event.dataTransfer.files]

      const audioFile = files.find((file) => file.type.startsWith('audio/'))
      if (audioFile) {
        updateAudioFile(audioFile)
        setAudioFileName(audioFile.name)
      }

      const cueSheetFile = files.find(
        (file) =>
          file.name.toLowerCase().endsWith('.cue') ||
          file.type === 'application/x-cue'
      )
      if (cueSheetFile) {
        try {
          loadCueSheet(await cueSheetFile.text())
          setCueSheetFileName(cueSheetFile.name)
          onCueSheetFileChange()
        } catch (error) {
          if (error instanceof Error) {
            toast(error.message, { type: 'error' })
          }
        }
      }

      const frontCoverFile = files.find((file) =>
        file.type.startsWith('image/')
      )
      if (frontCoverFile) {
        URL.revokeObjectURL(frontCoverBlobURL)
        updateFrontCover(frontCoverFile, frontCoverFile.name)
        const blobURL = URL.createObjectURL(frontCoverFile)
        setFrontCoverBlobURL(blobURL)
        setFrontCoverSize(await calcImageSize(blobURL))
      }
    }

    document.body.addEventListener('dragover', preventNavigation)
    document.body.addEventListener('drop', handler)
    return () => {
      document.body.removeEventListener('dragover', preventNavigation)
      document.body.removeEventListener('drop', handler)
    }
  }, [onCueSheetFileChange])

  function handleAudioFileChange({
    currentTarget,
  }: React.ChangeEvent<HTMLInputElement>) {
    const file = currentTarget.files?.[0]
    if (file) {
      updateAudioFile(file)
      setAudioFileName(file.name)
      currentTarget.files = null
    }
  }

  async function handleCueSheetChange({
    currentTarget,
  }: React.ChangeEvent<HTMLInputElement>) {
    const file = currentTarget.files?.[0]
    if (file) {
      try {
        loadCueSheet(await file.text())
        setCueSheetFileName(file.name)
        onCueSheetFileChange()
        currentTarget.files = null
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message, { type: 'error' })
        }
      }
    }
  }

  async function handleFrontCoverChange({
    currentTarget,
  }: React.ChangeEvent<HTMLInputElement>) {
    URL.revokeObjectURL(frontCoverBlobURL)

    const file = currentTarget.files?.[0]
    if (file) {
      updateFrontCover(file, file.name)
      const blobURL = URL.createObjectURL(file)
      setFrontCoverBlobURL(blobURL)
      setFrontCoverSize(await calcImageSize(blobURL))
      currentTarget.files = null
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
          <>
            <img src={frontCoverBlobURL} alt="Front Cover" height={75} />
            <div>
              <div>Width: {frontCoverSize.width}</div>
              <div>Height: {frontCoverSize.height}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

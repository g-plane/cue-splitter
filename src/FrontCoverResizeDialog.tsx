import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Label,
  SpinButton,
  type SpinButtonOnChangeData,
  makeStyles,
} from '@fluentui/react-components'
import { type FormEvent, useState } from 'react'
import { toast } from 'react-toastify'
import { resizeImage } from './image'
import { useSplitterStore } from './splitter'

const useStyles = makeStyles({
  form: {
    height: 'min-content',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  },
  spinButton: {
    width: '100px',
  },
})

export default function FrontCoverResizeDialog() {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const frontCover = useSplitterStore((state) => state.frontCover)
  const updateFrontCover = useSplitterStore((state) => state.updateFrontCover)
  const [width, setWidth] = useState(frontCover?.width ?? 1)
  const [height, setHeight] = useState(frontCover?.height ?? 1)
  const [keepRatio, setKeepRatio] = useState(true)

  const ratio = width / height

  function handleOpenChange(open: boolean) {
    setOpen(open)
    setWidth(frontCover?.width ?? 1)
    setHeight(frontCover?.height ?? 1)
  }

  function handleWidthChange({ value, displayValue }: SpinButtonOnChangeData) {
    const width = value ?? (displayValue ? Number.parseInt(displayValue) : 1)
    setWidth(width)
    if (keepRatio) {
      setHeight(~~(width / ratio))
    }
  }

  function handleHeightChange({ value, displayValue }: SpinButtonOnChangeData) {
    const height = value ?? (displayValue ? Number.parseInt(displayValue) : 1)
    setHeight(height)
    if (keepRatio) {
      setWidth(~~(height * ratio))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (frontCover) {
        updateFrontCover(await resizeImage(frontCover.file, width, height))
      }
      setOpen(false)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, { type: 'error' })
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, { open }) => handleOpenChange(open)}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button>Resize</Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Resize</DialogTitle>
            <DialogContent className={classes.form}>
              <div className={classes.formItem}>
                <Label weight="semibold">Width (px)</Label>
                <div className={classes.spinButton}>
                  <SpinButton
                    value={width}
                    onChange={(_, data) => handleWidthChange(data)}
                  />
                </div>
              </div>
              <div className={classes.formItem}>
                <Label weight="semibold">Height (px)</Label>
                <div className={classes.spinButton}>
                  <SpinButton
                    value={height}
                    onChange={(_, data) => handleHeightChange(data)}
                  />
                </div>
              </div>
              <div className={classes.formItem}>
                <Checkbox
                  label="Keep ratio"
                  checked={keepRatio}
                  onChange={(_, { checked }) => setKeepRatio(!!checked)}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" appearance="primary">
                Done
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

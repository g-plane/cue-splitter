import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
  Button,
  Input,
  Text,
  Tooltip,
  makeStyles,
  Link,
} from '@fluentui/react-components'
import { EditFilled, EditRegular, bundleIcon } from '@fluentui/react-icons'
import type { Track } from '@gplane/cue'
import { useState } from 'react'
import { useSplitterStore } from './splitter'
import { RE_CV, extractCVs } from './text'

const EditIcon = bundleIcon(EditFilled, EditRegular)

interface Props {
  track: Track
}

const useStyles = makeStyles({
  form: {
    height: 'min-content',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  },
  input: {
    width: '100%',
  },
  cv: {
    display: 'flex',
    columnGap: '4px',
  },
})

export default function ArtistEditDialog({ track }: Props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const updateTrack = useSplitterStore((state) => state.updateTrack)
  const [artist, setArtist] = useState(track?.performer ?? '')

  const originalArtist = track?.performer
  const hasCV = originalArtist && originalArtist.match(RE_CV)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateTrack({ ...track, performer: artist })
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
    setArtist(track?.performer ?? '')
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Tooltip content="Edit" relationship="label">
          <Button icon={<EditIcon />} appearance="subtle" />
        </Tooltip>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Edit Artist</DialogTitle>
            <DialogContent className={classes.form}>
              <Input
                className={classes.input}
                value={artist}
                onChange={(_, data) => setArtist(data.value)}
              />
              {hasCV && (
                <div className={classes.cv}>
                  <Text>Character Voice name(s) detected.</Text>
                  <Link
                    as="button"
                    onClick={() => setArtist(extractCVs(originalArtist))}
                  >
                    Extract
                  </Link>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" appearance="primary">
                Confirm
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

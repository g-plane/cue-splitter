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
  makeStyles,
  Link,
  Label,
} from '@fluentui/react-components'
import { EditRegular } from '@fluentui/react-icons'
import type { Track } from '@gplane/cue'
import { useState } from 'react'
import { useSplitterStore } from './splitter'
import { RE_CV, extractCVs } from './text'

interface Props {
  track: Track
}

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
  input: {
    width: '100%',
  },
  cv: {
    display: 'flex',
    columnGap: '4px',
  },
})

export default function TrackEditDialog({ track }: Props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const cue = useSplitterStore((state) => state.cue)
  const updateTrack = useSplitterStore((state) => state.updateTrack)
  const updateAlbum = useSplitterStore((state) => state.updateAlbum)
  const updateAlbumArtist = useSplitterStore((state) => state.updateAlbumArtist)
  const [title, setTitle] = useState(track?.title ?? '')
  const [artist, setArtist] = useState(track?.performer ?? '')
  const [album, setAlbum] = useState(cue?.title ?? '')
  const [albumArtist, setAlbumArtist] = useState(cue?.performer ?? '')

  const originalArtist = track?.performer
  const hasCV = originalArtist && originalArtist.match(RE_CV)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateTrack({ ...track, title, performer: artist })
    updateAlbum(album)
    updateAlbumArtist(albumArtist)
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
    setTitle(track?.title ?? '')
    setArtist(track?.performer ?? '')
    setAlbum(cue?.title ?? '')
    setAlbumArtist(cue?.performer ?? '')
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button icon={<EditRegular />}>Edit</Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Edit</DialogTitle>
            <DialogContent className={classes.form}>
              <div className={classes.formItem}>
                <Label weight="semibold">Title</Label>
                <Input
                  className={classes.input}
                  value={title}
                  onChange={(_, data) => setTitle(data.value)}
                />
              </div>
              <div className={classes.formItem}>
                <Label weight="semibold">Artist</Label>
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
              </div>
              <div className={classes.formItem}>
                <Label weight="semibold">Album</Label>
                <Input
                  className={classes.input}
                  value={album}
                  onChange={(_, data) => setAlbum(data.value)}
                />
                <Text>Note: Changing this will affect all tracks.</Text>
              </div>
              <div className={classes.formItem}>
                <Label weight="semibold">Album artist</Label>
                <Input
                  className={classes.input}
                  value={albumArtist}
                  onChange={(_, data) => setAlbumArtist(data.value)}
                />
                <Text>Note: Changing this will affect all tracks.</Text>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleCancel}>
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

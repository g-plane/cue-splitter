import { parse, type CueSheet } from '@gplane/cue'
import { create } from 'zustand'

interface SplitterState {
  cue: CueSheet | null
  loadCueSheet: (content: string) => void
  frontCover: Uint8Array | null
  frontCoverFileName: string
  updateFrontCover: (picture: Uint8Array, fileName: string) => void
}

export const useSplitterStore = create<SplitterState>()((set) => ({
  cue: null,
  loadCueSheet: (content: string) => {
    const { sheet, errors } = parse(content)
    if (errors.length > 0) {
      console.error(errors)
    } else {
      set({ cue: sheet })
    }
  },
  frontCover: null,
  frontCoverFileName: '',
  updateFrontCover: (picture: Uint8Array, fileName: string) => {
    set({ frontCover: picture, frontCoverFileName: fileName })
  },
}))

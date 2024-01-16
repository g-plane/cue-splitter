import {
  Button,
  Combobox,
  Label,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  makeStyles,
  shorthands,
  useId,
} from '@fluentui/react-components'
import { QuestionCircleRegular } from '@fluentui/react-icons'
import { useSplitterStore } from './splitter'

const options = [
  '%artist% - %title%',
  '%artist% - %album% - %title%',
  '%track%. %title%',
  '%paddedtrack%. %title%',
  '%track%. %artist% - %title%',
  '%paddedtrack%. %artist% - %title%',
]

const useStyles = makeStyles({
  formItem: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '2px',
  },
  placeholderItems: {
    ...shorthands.margin('0'),
    ...shorthands.padding('0'),
    listStylePosition: 'inside',
    '& code': {
      backgroundColor: '#ebebeb',
      ...shorthands.padding('0', '4px'),
      ...shorthands.borderRadius('4px'),
    },
  },
})

export default function FileNameFormatCombo() {
  const comboId = useId('file-name-format')
  const classes = useStyles()
  const format = useSplitterStore((state) => state.fileNameFormat)
  const setFormat = useSplitterStore((state) => state.setFileNameFormat)

  return (
    <div className={classes.formItem}>
      <div>
        <Label weight="semibold" htmlFor={comboId}>
          File Name Format
        </Label>
        <Popover openOnHover>
          <PopoverTrigger disableButtonEnhancement>
            <Button
              appearance="transparent"
              size="small"
              icon={<QuestionCircleRegular />}
            />
          </PopoverTrigger>
          <PopoverSurface>
            <ul className={classes.placeholderItems}>
              <li>
                <code>%title%</code> - song name
              </li>
              <li>
                <code>%artist%</code> - song artist
              </li>
              <li>
                <code>%album%</code> - album name
              </li>
              <li>
                <code>%albumartist%</code> - album artist
              </li>
              <li>
                <code>%track%</code> - track number without leading "0", for example "1"
              </li>
              <li>
                <code>%paddedtrack%</code> - track number with leading "0", for example "01"
              </li>
            </ul>
          </PopoverSurface>
        </Popover>
      </div>
      <Combobox
        id={comboId}
        aria-labelledby={comboId}
        freeform
        value={format}
        onInput={(event) => setFormat((event.target as HTMLInputElement).value)}
        selectedOptions={options.includes(format) ? [format] : []}
        onOptionSelect={(_, data) => setFormat(data.optionValue ?? '')}
      >
        {options.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Combobox>
    </div>
  )
}

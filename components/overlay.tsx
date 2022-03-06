import { useEffect, useState } from 'react'
import styled from 'styled-components'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ImageIcon from '@mui/icons-material/Image'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

const OverlaySetting = ({ initWidth, initHeight, onChangeWidth, onChangeHeight }: {
  initWidth: number,
  initHeight: number,
  onChangeWidth: (width: number) => void,
  onChangeHeight: (height: number) => void,
}) => {
  const [open, setOpen] = useState(false)
  const [widthStr, setWidthStr] = useState(String(initWidth))
  const [heightStr, setHeightStr] = useState(String(initHeight))

  useEffect(() => {
    const floatValue = parseFloat(widthStr)
    if (!isNaN(floatValue)) onChangeWidth(floatValue)
  }, [widthStr])

  useEffect(() => {
    const floatValue = parseFloat(heightStr)
    if (!isNaN(floatValue)) onChangeHeight(floatValue)
  }, [heightStr])

  return (
    <>
      <ListItemButton onClick={() => { setOpen(!open) }}>
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary={'Image Overlay'} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <InputArea>
          <div>Actual size of image [meter]</div>
          <TextField
            id="width-input"
            label="Width"
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">[m]</InputAdornment>
            }}
            error={isNaN(parseFloat(widthStr))}
            value={widthStr}
            onChange={e => setWidthStr(e.target.value)}
          />
          <br />
          <TextField
            id="height-input"
            label="Height"
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">[m]</InputAdornment>
            }}
            error={isNaN(parseFloat(heightStr))}
            value={heightStr}
            onChange={e => setHeightStr(e.target.value)}
          />
        </InputArea>
      </Collapse>
    </>
  )
}

export default OverlaySetting

const InputArea = styled.div`
  padding: 16px;
`

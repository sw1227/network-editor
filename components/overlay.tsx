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

const OverlaySetting = ({ initWidth, initHeight, onChangeWidth, onChangeHeight, onChangeRotation }: {
  initWidth: number,
  initHeight: number,
  onChangeWidth: (width: number) => void,
  onChangeHeight: (height: number) => void,
  onChangeRotation: (deg: number) => void,
}) => {
  const [open, setOpen] = useState(false)
  const [widthStr, setWidthStr] = useState(String(initWidth))
  const [heightStr, setHeightStr] = useState(String(initHeight))
  const [rotationStr, setRotationStr] = useState('0')

  useEffect(() => {
    const floatValue = parseFloat(widthStr)
    if (!isNaN(floatValue)) onChangeWidth(floatValue)
  }, [widthStr])

  useEffect(() => {
    const floatValue = parseFloat(heightStr)
    if (!isNaN(floatValue)) onChangeHeight(floatValue)
  }, [heightStr])

  useEffect(() => {
    const floatValue = parseFloat(rotationStr)
    if (!isNaN(floatValue)) onChangeRotation(floatValue)
  }, [rotationStr])

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

          <div>Rotation</div>
          <TextField
            id="rotation-input"
            label="Rotation"
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">[deg]</InputAdornment>
            }}
            error={isNaN(parseFloat(rotationStr))}
            value={rotationStr}
            onChange={e => setRotationStr(e.target.value)}
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

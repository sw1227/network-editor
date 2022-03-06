import { useEffect, useState } from 'react'
import styled from 'styled-components'
import mapboxgl from 'mapbox-gl'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ImageIcon from '@mui/icons-material/Image'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Slider from '@mui/material/Slider'

const OverlaySetting = ({
  initWidth, initHeight, initCenter, opacity,
  onChangeWidth, onChangeHeight, onChangeRotation, onChangeLng, onChangeLat, onChangeOpacity,
}: {
  initWidth: number,
  initHeight: number,
  initCenter: mapboxgl.LngLat,
  opacity: number,
  onChangeWidth: (width: number) => void,
  onChangeHeight: (height: number) => void,
  onChangeRotation: (deg: number) => void,
  onChangeLng: (deg: number) => void,
  onChangeLat: (deg: number) => void,
  onChangeOpacity: (opacity: number) => void,
}) => {
  const [open, setOpen] = useState(false)
  const [widthStr, setWidthStr] = useState(String(initWidth))
  const [heightStr, setHeightStr] = useState(String(initHeight))
  const [rotationStr, setRotationStr] = useState('0')
  const [lngStr, setLngStr] = useState(String(initCenter.lng))
  const [latStr, setLatStr] = useState(String(initCenter.lat))

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

  useEffect(() => {
    const floatValue = parseFloat(lngStr)
    if (!isNaN(floatValue)) onChangeLng(floatValue)
  }, [lngStr])

  useEffect(() => {
    const floatValue = parseFloat(latStr)
    if (!isNaN(floatValue)) onChangeLat(floatValue)
  }, [latStr])

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
        <InputList
          subheader={<ListSubheader>Actual size of image [meter]</ListSubheader>}
        >
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
        </InputList>
        <InputList
          subheader={<ListSubheader>Rotation</ListSubheader>}
        >
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
        </InputList>
        <InputList
          subheader={<ListSubheader>Location</ListSubheader>}
        >
          <TextField
            id="lng-input"
            label="Longitude"
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">[deg]</InputAdornment>
            }}
            error={isNaN(parseFloat(lngStr))}
            value={lngStr}
            onChange={e => setLngStr(e.target.value)}
          />
          <br />
          <TextField
            id="lng-input"
            label="Latitude"
            variant="standard"
            InputProps={{
              endAdornment: <InputAdornment position="end">[deg]</InputAdornment>
            }}
            error={isNaN(parseFloat(latStr))}
            value={latStr}
            onChange={e => setLatStr(e.target.value)}
          />
        </InputList>

        <InputList
          subheader={<ListSubheader>Opacity</ListSubheader>}
        >
          <OpacitySlider
            value={opacity}
            onChange={(_, value) => onChangeOpacity(value as number)}
            min={0}
            max={1}
            step={0.1}
            size="small"
            aria-label="Opacity"
            valueLabelDisplay="auto"
          />
        </InputList>
      </Collapse>
    </>
  )
}

export default OverlaySetting

const InputList = styled(List)`
  padding: 24px;
`

const OpacitySlider = styled(Slider)`
  margin-top: 28px;
`

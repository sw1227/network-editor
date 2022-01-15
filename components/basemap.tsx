import { useState } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MapIcon from '@mui/icons-material/Map'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

export const MAP_STYLE = {
  Default_ja: 'mapbox://styles/sw1227/ckqyzf3tm1s0v17rv3rnaxgxm',
  Light_en: 'mapbox://styles/mapbox/light-v10',
  Dark_en: 'mapbox://styles/mapbox/dark-v10',
  Outdoors_en: 'mapbox://styles/mapbox/outdoors-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
} as const
export type MAP_STYLE = typeof MAP_STYLE[keyof typeof MAP_STYLE]

const BaseMapSelector = ({ mapStyle, onSelect }: {
  mapStyle: keyof typeof MAP_STYLE,
  onSelect: (newStyle: keyof typeof MAP_STYLE) => void,
}) => {
  const [open, setOpen] = useState(false)
  const handleSelectStyle = (style: keyof typeof MAP_STYLE) => () => {
    onSelect(style)
    setOpen(false)
  }

  return (
    <>
      <ListItemButton onClick={() => { setOpen(!open) }}>
        <ListItemIcon>
          <MapIcon />
        </ListItemIcon>
        <ListItemText primary={`Base map: ${mapStyle}`} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {(Object.keys(MAP_STYLE) as (keyof typeof MAP_STYLE)[]).map(style => (
            <ListItemButton
              key={style}
              sx={{ pl: 4 }}
              onClick={handleSelectStyle(style)}
            >
              <ListItemText primary={style} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  )
}

export default BaseMapSelector

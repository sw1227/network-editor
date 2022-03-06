import { useState } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ImageIcon from '@mui/icons-material/Image'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

const OverlaySetting = ({}) => {
  const [open, setOpen] = useState(false)

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
        TODO:
      </Collapse>
    </>
  )
}

export default OverlaySetting

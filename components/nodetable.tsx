import { useState } from 'react'
import styled from 'styled-components'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Collapse from '@mui/material/Collapse'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Node } from '../lib/map'

const format = (num: number, len: number) => Math.round(num * 10 ** len) / 10 ** len

const NodeTable = ({ nodes, hoverNodeId, onEnterRow, onLeaveRow, onDeleteRow }: {
  nodes: Node[],
  hoverNodeId: Node['id'] | undefined,
  onEnterRow: (node: Node['id']) => () => void,
  onLeaveRow: () => void,
  onDeleteRow: (node: Node['id']) => () => void,
}) => {
  const [modalOpen, setModalOpen] = useState(true)

  return (
    <>
      <ListItemButton onClick={() => { setModalOpen(!modalOpen) }}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        < ListItemText primary="Nodes" />
        {modalOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={modalOpen} timeout="auto" unmountOnExit>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 20 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="center">id</TableCell>
                <TableCell align="center">latitude</TableCell>
                <TableCell align="center">longitude</TableCell>
                <TableCell align="center">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodes.map(node => (
                <HoverRow
                  key={node.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onMouseEnter={onEnterRow(node.id)}
                  onMouseLeave={onLeaveRow}
                  style={{ background: hoverNodeId === node.id ? '#def' : 'white' }}
                >
                  <TableCell component="th" scope="row">{node.id}</TableCell>
                  <TableCell align="left">{format(node.lngLat.lat, 6)}</TableCell>
                  <TableCell align="left">{format(node.lngLat.lng, 6)}</TableCell>
                  <TableCell align="center">
                    <IconButton aria-label="delete" size="small" onClick={onDeleteRow(node.id)}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </HoverRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </>
  )
}

export default NodeTable

const HoverRow = styled(TableRow)`
  &:hover {
    background: #def;
  }
`

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
import { Edge } from '../lib/map'

const EdgeTable = ({ edges, hoverEdgeId, onEnterRow, onLeaveRow, onDeleteRow }: {
  edges: Edge[],
  hoverEdgeId: Edge['id'] | undefined,
  onEnterRow: (edgeId: number) => () => void,
  onLeaveRow: () => void,
  onDeleteRow: (edgeIdx: number) => () => void,
}) => {
  const [modalOpen, setModalOpen] = useState(true)

  return (
    <>
      <ListItemButton onClick={() => { setModalOpen(!modalOpen) }}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        < ListItemText primary="Edges" />
        {modalOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={modalOpen} timeout="auto" unmountOnExit>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 20 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="center">id</TableCell>
                <TableCell align="center">Edge info</TableCell>
                <TableCell align="center">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {edges.map(edge => (
                <HoverRow
                  key={edge.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onMouseEnter={onEnterRow(edge.id)}
                  onMouseLeave={onLeaveRow}
                  style={{ background: hoverEdgeId === edge.id ? '#def' : 'white' }}
                >
                  <TableCell component="th" scope="row">{edge.id}</TableCell>
                  <TableCell align="left">Node {edge.source} → Node {edge.target}</TableCell>
                  <TableCell align="center">
                    <IconButton aria-label="delete" size="small" onClick={onDeleteRow(edge.id)}>
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

export default EdgeTable

const HoverRow = styled(TableRow)`
  &:hover {
    background: #def;
  }
`

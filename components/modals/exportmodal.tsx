import { useState } from 'react'
import { FeatureCollection, Feature } from 'geojson'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Tooltip from '@mui/material/Tooltip'
import { Node, Edge } from '../../lib/map'
import { StyledModal, Backdrop, boxStyle } from './common'

const createNodeLinkData = (nodes: Node[], edges: Edge[]) => {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      lng: node.lngLat.lng,
      lat: node.lngLat.lat,
    })),
    links: edges.map(edge => ({
      source: edge.source,
      target: edge.target,
    }))
  }
}

const createGeoJsonData = (nodes: Node[], edges: Edge[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: [
      ...nodes.map(node => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [node.lngLat.lng, node.lngLat.lat]
        },
        properties: {
          id: node.id
        },
      } as Feature)),
      ...edges.map(edge => {
        const p1 = nodes.find(n => n.id === edge.source)
        const p2 = nodes.find(n => n.id === edge.target)
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: (!p1 || !p2) ? [] : [
              [p1.lngLat.lng, p1.lngLat.lat],
              [p2.lngLat.lng, p2.lngLat.lat]
            ],
          },
          properties: {
            source: edge.source,
            target: edge.target,
            id: edge.id,
          }
        } as Feature
      })
    ]
  }
}

const ExportModal = ({ open, onCloseModal, nodes, edges }: {
  open: boolean,
  onCloseModal: () => void,
  nodes: Node[],
  edges: Edge[],
}) => {
  const [format, setFormat] = useState('node-link')
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat((event.target as HTMLInputElement).value)
  }

  const handleExport = () => {
    const data = format === 'node-link'
      ? createNodeLinkData(nodes, edges)
      : createGeoJsonData(nodes, edges)
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    onCloseModal()
  }

  return (
    <StyledModal
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      open={open}
      onClose={onCloseModal}
      BackdropComponent={Backdrop}
    >
      <Box sx={boxStyle}>
        <Stack spacing={2}>
          <h2 id="modal-title">Export network</h2>
          <FormControl component="fieldset">
            <FormLabel component="legend">Format</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="controlled-radio-buttons-group"
              value={format}
              onChange={handleFormatChange}
            >
              <Tooltip title="https://networkx.org/documentation/stable/reference/readwrite/json_graph.html" placement="left">
                <FormControlLabel value="node-link" control={<Radio />} label="Node-link json" />
              </Tooltip>
              <Tooltip title="FeatureCollection of nodes(Point) and edges(LineString)" placement="left">
                <FormControlLabel value="geojson" control={<Radio />} label="GeoJSON" />
              </Tooltip>
            </RadioGroup>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Stack>
      </Box>
    </StyledModal>
  )
}

export default ExportModal

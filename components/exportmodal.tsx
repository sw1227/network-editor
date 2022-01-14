import { useState } from 'react'
import styled from 'styled-components'
import { FeatureCollection, Feature } from 'geojson'
import ModalUnstyled from '@mui/base/ModalUnstyled'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { Node, Edge } from '../lib/map'

const createNodeLinkData = (nodes: Node[], edges: Edge[]) => {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      lng: node.lngLat.lng,
      lat: node.lngLat.lat,
    })),
    links: edges.map(edge => ({
      source: edge[0],
      target: edge[1],
    }))
  }
}

const createGeoJsonData = (nodes: Node[], edges: Edges[]): FeatureCollection => {
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
        const p1 = nodes.find(n => n.id === edge[0])
        const p2 = nodes.find(n => n.id === edge[1])
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
            // TODO: node info?
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
  const [value, setValue] = useState('node-link')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

  const handleExport = async () => {
    const data = value === 'node-link'
      ? createNodeLinkData(nodes, edges)
      : createGeoJsonData(nodes, edges)
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = await URL.createObjectURL(blob)
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
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel value="node-link" control={<Radio />} label="Node-link json" />
              <FormControlLabel value="geojson" control={<Radio />} label="GeoJSON" />
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

const StyledModal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`

const boxStyle = {
  width: 400,
  bgcolor: 'background.paper',
  p: 2,
  px: 4,
  pb: 3,
}

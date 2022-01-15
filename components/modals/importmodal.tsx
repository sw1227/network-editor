import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { NodeLinkJson, isNodeLinkJson } from '../../lib/map'
import { StyledModal, Backdrop, boxStyle, NoMarginDiv } from './common'

const ImportModal = ({ open, onCloseModal, onImportNodeLinkJson }: {
  open: boolean,
  onCloseModal: () => void,
  onImportNodeLinkJson: (data: NodeLinkJson) => void,
}) => {
  const [files, setFiles] = useState<FileList | null>(null)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files)
  }

  const handleClose = () => {
    setFiles(null)
    onCloseModal()
  }

  const handleImport = () => {
    if (!files || files.length < 1) return
    // Read and import json
    const fr = new FileReader()
    fr.onload = e => {
      const res = e.target?.result
      if (typeof res !== 'string') return
      // Parse node-link json
      const data = JSON.parse(res)
      if (isNodeLinkJson(data)) {
        onImportNodeLinkJson(data)
        setFiles(null)
      } else {
        console.log('TODO: parse error!')
      }
    }
    // Only supports single file
    fr.readAsText(files[0])
  }

  return (
    <StyledModal
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      open={open}
      onClose={handleClose}
      BackdropComponent={Backdrop}
    >
      <Box sx={boxStyle}>
        <Stack spacing={2}>
          <h2 id="modal-title">Import network</h2>
          <NoMarginDiv>
            Format: <a href="https://networkx.org/documentation/stable/reference/readwrite/json_graph.html">Node-link json</a>
          </NoMarginDiv>
          <input type="file" id="upload" accept='.json,.geojson' onChange={handleFileChange} />
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={handleImport}
            disabled={!files || files.length < 1}
          >
            Reset map & Import
          </Button>
        </Stack>
      </Box>
    </StyledModal>
  )
}

export default ImportModal

import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { StyledModal, Backdrop, boxStyle, NoMarginDiv } from './common'

const AddImageModal = ({ open, onCloseModal, onImportImage }: {
  open: boolean,
  onCloseModal: () => void,
  onImportImage: (image: HTMLImageElement) => void,
}) => {
  const [openSnack, setOpenSnack]= useState(false) // TODO: not used
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
    // Only supports single file
    const image = new Image();
    image.src = URL.createObjectURL(files[0])
    image.onload = () => {
      onImportImage(image)
    }
    handleClose()
  }

  return (
    <>
      <Snackbar
        open={openSnack}
        autoHideDuration={6000}
        onClose={() => setOpenSnack(false)}
        message="Import failed"
        action={
          <Button size="small" onClick={() => setOpenSnack(false)}>
            Close
          </Button>
        }
      />
      <StyledModal
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
      >
        <Box sx={boxStyle}>
          <Stack spacing={2}>
            <h2 id="modal-title">Add raster image overlay</h2>
            <NoMarginDiv>
              Select an image
            </NoMarginDiv>
            <input type="file" id="upload" accept='image/*' onChange={handleFileChange} />
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={handleImport}
              disabled={!files || files.length < 1}
            >
              Add image
            </Button>
          </Stack>
        </Box>
      </StyledModal>
    </>
  )
}

export default AddImageModal

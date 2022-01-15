import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { StyledModal, Backdrop, boxStyle, NoMarginDiv } from './common'

const ResetModal = ({ open, onCloseModal, onReset  }: {
  open: boolean,
  onCloseModal: () => void,
  onReset: () => void,
}) => {
  const handleReset = () => {
    onReset()
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
          <h2 id="modal-title">Reset</h2>
          <NoMarginDiv>All the nodes and edges will be deleted.</NoMarginDiv>
          <Button
            variant="contained"
            color="warning"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>
      </Box>
    </StyledModal>
  )
}

export default ResetModal

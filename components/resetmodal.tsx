import styled from 'styled-components'
import ModalUnstyled from '@mui/base/ModalUnstyled'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

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
          <ModalText>All the nodes and edges will be deleted.</ModalText>
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

const ModalText = styled('div')`
  margin: 0 !important;
`

const boxStyle = {
  width: 400,
  bgcolor: 'background.paper',
  p: 2,
  px: 4,
  pb: 3,
}

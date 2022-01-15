import styled from 'styled-components'
import ModalUnstyled from '@mui/base/ModalUnstyled'

export const StyledModal = styled(ModalUnstyled)`
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

export const Backdrop = styled('div')`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-tap-highlight-color: transparent;
`

export const boxStyle = {
  width: 400,
  bgcolor: 'background.paper',
  p: 2,
  px: 4,
  pb: 3,
}

export const NoMarginDiv = styled('div')`
  margin: 0 !important;
`

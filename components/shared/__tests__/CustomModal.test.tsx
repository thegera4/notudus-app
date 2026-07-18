jest.mock('lottie-react-native', () => 'LottieView')

import { TouchableOpacity } from 'react-native'
import { fireEvent, render, UNSAFE_getAllByType } from '@testing-library/react-native'
import CustomModal from '@/components/shared/CustomModal'

const defaultProps = {
  title: 'Delete Note',
  message: 'Are you sure?',
  confirmText: 'DELETE',
  cancelText: 'CANCEL',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  visible: true,
}

describe('components/shared/CustomModal', () => {
  beforeEach(() => {
    defaultProps.onConfirm.mockClear()
    defaultProps.onCancel.mockClear()
  })

  it('renders the title and message', () => {
    const { getByText } = render(<CustomModal {...defaultProps} />)
    expect(getByText('Delete Note')).toBeTruthy()
    expect(getByText('Are you sure?')).toBeTruthy()
    expect(getByText('DELETE')).toBeTruthy()
    expect(getByText('CANCEL')).toBeTruthy()
  })

  it('calls onCancel when the cancel button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<CustomModal {...defaultProps} />)
    const pressables = UNSAFE_getAllByType(TouchableOpacity)

    fireEvent.press(pressables[0])
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when the confirm button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<CustomModal {...defaultProps} />)
    const pressables = UNSAFE_getAllByType(TouchableOpacity)

    fireEvent.press(pressables[1])
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    expect(defaultProps.onCancel).not.toHaveBeenCalled()
  })
})

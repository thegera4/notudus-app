import { useContext } from 'react'
import { BottomSheetContext } from '@/contexts/bottomSheetContext';
import { BottomSheetContextProps } from '@/types';

/** This custom hook returns the context for the BottomSheet which contains the todos, the setTodos function, and the openBottomSheet function.
* @returns {BottomSheetContextProps} Object with the todos, the setTodos function, and the openBottomSheet function.
*/
export const useBottomSheet = (): BottomSheetContextProps => useContext(BottomSheetContext)
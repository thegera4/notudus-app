import React, { createContext, useContext, useState } from 'react';
import Todo from '@/models/Todo';
import BottomSheet from '@/components/todos/BottomSheet';

interface BottomSheetContextProps {
  openBottomSheet: (todo?: Todo | null) => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps | undefined>(undefined);

interface BottomSheetProviderProps {
  children: React.ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({ children }) => {
    
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const openBottomSheet = (todo: Todo | null = null) => {
    setSelectedTodo(todo);
    setBottomSheetVisible(true);
  };

  return (
    <BottomSheetContext.Provider value={{ openBottomSheet }}>
      {children}
      {bottomSheetVisible && (
        <BottomSheet
          setVisible={() => setBottomSheetVisible(!bottomSheetVisible)}
          todos={[]} // Pass the appropriate todos state here
          setTodos={() => {}} // Pass the appropriate setTodos function here
          selectedTodo={selectedTodo}
        />
      )}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
}
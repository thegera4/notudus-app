import React from "react"
import { Ionicons } from "@expo/vector-icons"
import Todo from "@/models/Todo"

/**Note model type.*/
export interface NoteModelType {
    id: string;
    title: string;
    content: string;
    locked: number;
    date: string;
}

/**Props received by the NoteItem component.*/
export type NoteItemProps = {
    note: NoteModelType,
    onPress: (note: NoteModelType) => void,
}

/**Props received by the TopBar component.*/
export type TopBarProps = {
    screen: string,
    onLockPress?: () => void,
    auth: boolean,
    onViewPress?: () => void,
    view: string,
    onSearchPress?: () => void,
    onBackPress?: () => void,
    currentNote?: NoteModelType,
    onShieldPress?: () => void,
    newNoteLocked?: boolean,
    numberOfTasks?: number
}

/**Props received by the TopBarIcon component.*/
export type TopBarIconProps = {
    onPress: () => void,
    iconName: React.ComponentProps<typeof Ionicons>['name'],
    size: number,
    color: string,
}

/**Type for the FAB button props.*/
export type FABProps = {
    onPress: () => void
}

/**Type for the SearchOverlay component props.*/
export type SearchOverlayProps = {
    visible: boolean
    notes: NoteModelType[]
    onClose: () => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    handleNotePressed: (note: NoteModelType) => void
}

/**Type for the AuthContext.*/
export interface AuthContextType {
    auth: boolean;
    setAuth: React.Dispatch<React.SetStateAction<boolean>>
}

/**Type for the Custom Modal component props.*/
export interface CustomModalProps {
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm: () => void
    onCancel: () => void
    visible: boolean
}

/**Type for the BottomSheet component props.*/
export type BottomSheetProps = {
    setVisible: () => void,
    todos: Todo[],
    setTodos: (todos: Todo[]) => void,
    selectedTodo?: Todo | null
}

/**Type for the TodoItem component props.*/
export type TodoItemProps = {
    todo: Todo,
    onDelete: (id: string) => void,
}

/**Type for the NoDataAnimation component props.*/
export type NoDataAnimationProps = {
    screen: string
}

/**Type for the BottomSheetContextProps.*/
export interface BottomSheetContextProps {
    openBottomSheet: (todo?: Todo | null) => void;
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

/**Type for the BottomSheetProviderProps.*/
export interface BottomSheetProviderProps {
    children: React.ReactNode;
}
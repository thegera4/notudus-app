import React from "react"
import { Ionicons } from "@expo/vector-icons"

/**Note model type.*/
export interface Note {
    id: string;
    title: string;
    content: string;
    locked: number;
    date: string;
}

/**Props received by the NoteItem component.*/
export type NoteItemProps = {
    note: Note,
    onPress: (note: Note) => void,
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
    currentNote?: Note,
    onShieldPress?: () => void,
    newNoteLocked?: boolean,
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
    notes: Note[]
    onClose: () => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    handleNotePressed: (note: Note) => void
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
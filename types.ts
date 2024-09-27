import { Ionicons } from "@expo/vector-icons"

/**Note model type.*/
export interface Note {
    id: number;
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
}
/**Props received by the TopBarIcon component.*/
export type TopBarIconProps = {
    onPress: () => void,
    iconName: React.ComponentProps<typeof Ionicons>['name'],
    size: number,
    color: string,
}
/**Type for the search value in the notes screen. It can be a string or null.*/
export type noteSearchType = string | null
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
}
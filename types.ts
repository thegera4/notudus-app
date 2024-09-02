import { Ionicons } from "@expo/vector-icons"
/**
 * Note model.
 */
export interface Note {
    id: number;
    title: string;
    content: string;
    locked: number;
    date: string;
}
/**
 * Props received by the NoteItem component.
 */
export type NoteItemProps = {
    note: Note
}
/**
 * Props received by the TopBar component.
 */
export type TopBarProps = {
    screen: string
}
/**
 * Props received by the TopBarIcon component.
 */
export type TopBarIconProps = {
    onPress: () => void,
    iconName: React.ComponentProps<typeof Ionicons>['name'],
    size: number,
    color: string,
}
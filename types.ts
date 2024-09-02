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
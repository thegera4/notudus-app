class Note  {
    constructor(id: number, title: string, content: string, date: string, locked: number) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.date = date;
        this.locked = locked;
    }
    id: number;
    title: string;
    content: string;
    date: string;
    locked: number;
    
}

export default Note;
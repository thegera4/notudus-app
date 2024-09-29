export default class Note  {
    constructor(id: string, title: string, content: string, date: string, locked: number) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.date = date;
        this.locked = locked;
    }
    id: string;
    title: string;
    content: string;
    date: string;
    locked: number;
    
}
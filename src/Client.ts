import { Room } from "./Room";
import ws from 'ws';

export class Client {
    room: Room;
    private socket: ws;
    private uid: string;
    private username: string;

    constructor(socket:ws) {
        this.socket = socket;
    }
    
    get id() {
        return this.uid;
    }

    get currentRoom() {
        return this.room;
    }

    get name() {
        return this.username;
    }

}
import { Room } from "./Room";
import ws from 'ws';

export class Client {
    private room: Room;
    private socket: ws;
    private uid: string;
    private username: string;

    public joinRoom(room: Room) {
        if(this.room !== undefined) {
            this.leaveRoom();
        }
        this.room = room;
        this.room.addClient(this);
    }

    public leaveRoom() {
        this.room.removeClient(this);
        this.room = undefined;
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
import { Client } from "./Client";
import { Firebase } from "./Firebase";
import ws from 'ws';

export class Room {
    clients: Client[];
    id: string;
    fb: Firebase;
    server: ws.Server;

    constructor() {
        this.server = new ws.Server({ noServer: true });
        this.server.on("connection", (socket: ws) => {
            this.clients.push(new Client(socket));
        });
    }

    get wss() {
        return this.server;
    }
    
    /**
     * Removes a client from this room.
     * @param client client to remove
     */
    public removeClient(client: Client) {
        const found = this.clients.find((c: Client) => c.id === client.id);
        if(found === undefined) return; // not found in room

        this.fb.removeFromRoom(found);
        found.room = undefined;
        
        // filter out the target client from this 
        this.clients = this.clients.filter(val => {
            val.id !== client.id;
        });
    }

    /**
     * Adds a client as a member of this room.
     * @param client client to add
     */
    public addClient(client: Client) {
        client.room = this;
        this.clients.push(client);
        this.fb.addToRoom(client);
    }

    /**
     * Checks if the given client is a member of this room.
     * @param client client to check
     */
    public checkMembership(client: Client): boolean {
        return this.clients.find(s => s.id === client.id) !== undefined;
    }

}
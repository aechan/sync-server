import { Client } from "./Client";
import { Firebase } from "./Firebase";

export class Room {
    clients: Client[];
    id: string;
    fb: Firebase;
    /**
     * Removes a client from this room.
     * HELPER METHOD, DONT CALL THIS DIRECTLY UNLESS FROM `Client` CLASS.
     * @param client client to remove
     */
    public removeClient(client: Client) {
        const found = this.clients.find((c: Client) => c.id === client.id);
        if(found === undefined) return;

        // filter out the target client from this 
        this.clients = this.clients.filter(val => {
            val.id !== client.id;
        });
    }

    /**
     * Checks if the given client is a member of this room.
     * @param client client to check
     */
    public checkMembership(client: Client): boolean {
        return this.clients.find(s => s.id === client.id) !== undefined;
    }

    /**
     * Adds a client as a member of this room.
     * @param client client to add
     */
    public addClient(client: Client) {
        client.joinRoom(this);
        this.clients.push(client);
        this.fb.addToRoom(client);
    }

    /**
     * Forcefully removes member client from this room.
     * @param client client to kick
     */
    public kick(client: Client) {
        this.fb.removeFromRoom(client);
        if(this.checkMembership(client))
            client.leaveRoom();
    }
}
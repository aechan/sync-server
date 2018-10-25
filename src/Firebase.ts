import admin from 'firebase-admin';
import { Client } from './Client';
const service = require('../firebase-admin-serviceaccount.json');

enum DBConst {
    ROOM = '/rooms/',
    USER = '/users/',
    CLIENTS = '/clients/'
}

export class Firebase {
    constructor() {
        admin.initializeApp(service);
    }

    public async validateUser(jwt: string): Promise<admin.auth.DecodedIdToken> {
        const res: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(jwt).catch(() => {
            return undefined;
        });

        return res;
    }

    public async addToRoom(client: Client) {
        await admin.database().ref(`${DBConst.ROOM}${client.currentRoom.id}${DBConst.CLIENTS}${client.id}`).set({
            uid: client.id,
            username: client.name
        });
    }

    public async removeFromRoom(client: Client) {
        await admin.database().ref(`${DBConst.ROOM}${client.currentRoom.id}${DBConst.CLIENTS}${client.id}`).remove();
    }
}
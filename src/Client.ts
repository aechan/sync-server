/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/
import firebaseAdmin from 'firebase-admin';
import socketIo from 'socket.io';
import { firebaseConnector } from './FirebaseConnector';
import { logger } from './Logger';

/**
 * Represents a client and its data/socket connection
 */
export class Client {
    public socketConnection: socketIo.Socket;
    public uid: string;
    public name: string;
    public roomId: string;

    constructor(uid: string, socket: socketIo.Socket) {
        this.socketConnection = socket;
        this.uid = uid;
        this.roomId = '';
    }

    get json(): {} {
        return {
            uid: this.uid,
            name: this.name
        };
    }

    get socket(): socketIo.Socket {
        return this.socketConnection;
    }
}

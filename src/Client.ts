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
import { Room } from './Room';

/**
 * Represents a client and its data/socket connection
 */
export class Client {
    public socketConnection: socketIo.Socket;
    public uid: string;
    public name: string;
    public roomId: string;
    public room: Room;
    public imageURL: string;
  
    constructor(uid: string, socket: socketIo.Socket) {
        this.socketConnection = socket;
        this.uid = uid;
        this.roomId = '';

        //loading user info
        firebaseConnector.getUserInfo(this.uid).then((val: { imageURL: string; displayName: string }) => {
            this.imageURL = val.imageURL;
            this.name = val.displayName;
            this.socketConnection.emit('UserInfoLoaded', this.json);
        }).catch((err: string) => {
            logger.error(err);
        });

        this.socket.on('Chat', (data: string) => {
            this.room.chat(data, this);
        });

        this.socket.on('StateUpdate', (data: { videoURL: string; playing: boolean; time: number }) => {
            this.room.stateUpdate(data, this);
        });
    }

    get json(): {} {
        return {
            uid: this.uid,
            name: this.name,
            imageURL: this.imageURL,
            roomId: this.roomId
        };
    }

    get socket(): socketIo.Socket {
        return this.socketConnection;
    }
}

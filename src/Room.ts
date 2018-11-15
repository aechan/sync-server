/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/

import socketIo from 'socket.io';
import { Client } from './Client';

/**
 * Manages a single room and it's clients/sockets
 */
export class Room {
    private roomId: string;
    private room: socketIo.Namespace;
    private clients: Client[];

    private videoURL: string;
    private ownerUID: string;
    private imageURL: string;
    private name: string;
    private ownerName: string;

    constructor(roomId: string, roomNSP: socketIo.Namespace) {
        this.roomId = roomId;
        this.room = roomNSP;
        this.clients = [];
    }

    public addClient(client: Client): void {
        this.clients.push(client);
        client.socket.emit('JoinedRoom', this.json);
        client.roomId = this.roomId;
    }

    public removeClient(client: Client): void {
        this.clients = this.clients.filter((val: Client) => {
            return val.uid !== client.uid;
        });
        client.roomId = '';
    }

    get id(): string {
        return this.roomId;
    }

    get json(): {} {
        return {
            roomId: this.roomId,
            //room: this.room,
            //clients: this.clients,
            videoURL: this.videoURL
        };
    }
}

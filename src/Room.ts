/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/

import socketIo from 'socket.io';
import { Client } from './Client';
import { logger } from './logger';

/**
 * Manages a single room and it's clients/sockets
 */
export class Room {
    public videoURL: string;
    public time: number;

    private roomId: string;
    private room: socketIo.Namespace;
    private clients: Client[];

    private ownerUID: string;
    private imageURL: string;
    private name: string;
    private ownerName: string;
    private chatLog: { message: string; client: Client }[];
    private playing: boolean;
    private syncTimer: NodeJS.Timer;

    constructor(roomId: string, roomNSP: socketIo.Namespace) {
        this.roomId = roomId;
        this.ownerUID = this.roomId;
        this.room = roomNSP;
        this.clients = [];
        this.chatLog = [];
        this.time = 0;
        this.playing = false;
        this.videoURL = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
        this.imageURL = '';
        this.name = '';
        this.syncTimer = setInterval(() => {
            this.sync();
        }, 200);
    }

    public addClient(client: Client): void {
        this.clients.push(client);
        client.socket.emit('JoinedRoom', this.json);
        client.roomId = this.roomId;
        client.room = this;
        if (this.ownerUID === client.uid) {
            client.socket.emit('Owner', true);
            this.ownerName = client.name;
        }
        this.updateRoomInfo();
        this.updateChatLog(client);
    }

    public removeClient(client: Client): void {
        this.clients = this.clients.filter((val: Client) => {
            return val.uid !== client.uid;
        });
        client.roomId = '';
        client.room = undefined;
        this.updateRoomInfo();
    }

    public chat(message: string, client: Client): void {
        this.room.emit('Chat', {
            message: message,
            client: client.json
        });
        this.chatLog.push({ message: message, client: client });
    }

    public sync(): void {
        this.room.emit('Sync', {time: this.time, url: this.videoURL, playing: this.playing});
    }

    public setRoomVideoURL(url: string, client: Client): void {
        if (client.uid === this.ownerUID) {
            this.videoURL = url;
            this.time = 0;
            this.playing = false;
        }
        this.printState();
    }

    public setRoomPlaying(playing: boolean, client: Client): void {
        if (client.uid === this.ownerUID) {
            this.playing = playing;
        }
        this.printState();
    }

    public setRoomName(name: string, client: Client): void {
        return;
    }

    get id(): string {
        return this.roomId;
    }

    get json(): {} {
        return {
            roomId: this.roomId,
            clients: this.clients.map((val: Client) => { return val.json; }),
            videoURL: this.videoURL
        };
    }

    private printState(): void {
        logger.info(`${this.videoURL}, ${this.playing}, ${this.time}`);
    }

    private updateRoomInfo(): void {
        this.room.emit('RoomInfo', this.json);
    }

    private updateChatLog(cli: Client): void {
        this.chatLog.forEach((chat: { message: string; client: Client }) => {
            cli.socket.emit('Chat', {
                message: chat.message,
                client: chat.client.json
            });
        });
    }

}

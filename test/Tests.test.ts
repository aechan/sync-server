/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/
import request from 'request';
import socketIoClient from 'socket.io-client';
import { logger } from '../src/Logger';
import { Server } from '../src/Server';

/**
 * Main test runner
 */
describe('Sync-Server Integration Tests', () => {
    let server: Server;
    const testRoom: string = 'testRoom';
    let uri: string;
    const port: number = 4322;
    let socket: SocketIOClient.Socket;

    test('Connect and Create Room', (done: jest.DoneCallback) => {
        socket.on('connect', () => {
            socket.emit('JoinRoom', testRoom);
            socket.on('JoinedRoom', (data: { roomId: string}) => {
                expect(data.roomId).toBe(testRoom);
                done();
            });
        });
    });

    test('Is debug server working?', (done: jest.DoneCallback) => {
        request.get(uri, (body: string) => {
            let nbody: { roomId: string };
            try {
                 nbody = <{ roomId: string }>JSON.parse(body);
            } catch (err) {
                logger.error(<string>err);
                logger.info(body);
            }
            expect(nbody.roomId).toBe(testRoom);
            done();
        });
    });

    beforeAll((done: jest.DoneCallback) => {
        server = new Server();
        uri = `http://localhost:${port}/rooms/${testRoom}`;
        server.start(port, done);
        socket = socketIoClient(`http://localhost:${port}`);
    });

    afterAll((done: jest.DoneCallback) => {
        server.stop(done);
    });
});

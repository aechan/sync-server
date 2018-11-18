/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/

/**
 * Configure and bootstrap server stack
 * Main entrypoint
 */
import asciiArt from 'ascii-art';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import firebaseAdmin from 'firebase-admin';
import http from 'http';
import socketIo from 'socket.io';
import { Client } from './Client';
import { firebaseConnector } from './FirebaseConnector';
import { logger } from './logger';
import { Room } from './Room';

/**
 * Main server class. Provides interface for start/stop
 */
export class Server {
  private app: express.Express;
  private server: http.Server;
  private ws: socketIo.Server;
  private rooms: Room[];
  private clients: Client[];

  public start(port?: number, callback?: () => void): void {
    // env vars available through process.env
    dotenv.config();

    // init our connection to firebase since we've loaded env vars
    firebaseConnector.initialize();

    this.app = express();
    this.app.use(cors());
    this.server = new http.Server(this.app);
    this.ws = socketIo(this.server);
    this.rooms = [];
    this.clients = [];

    // for debug
    this.app.get('/rooms/:roomId', (req: express.Request, res: express.Response) => {
      const roomIdKey: string = 'roomId';
      const room: Room = this.rooms.find((r: Room) => {
        return r.id === req.param(roomIdKey);
      });
      res.send(room.json);
    });

    this.app.get('/rooms/', (req: express.Request, res: express.Response) => {
      const token: string = req.param('jwt');
      if (token.length === 0 || token === undefined) {
        res.sendStatus(400).send('Not authenticated');

        return;
      } else {
        firebaseConnector.verifyUser(token).then((val: firebaseAdmin.auth.DecodedIdToken) => {
          res.send(this.rooms.map((value: Room) => { return value.json; }));
        }).catch((err: string) => {
          res.send(err);
        });
      }
    });

    this.app.get('/clients/', (req: express.Request, res: express.Response) => {
      const token: string = req.param('jwt');
      if (token.length === 0 || token === undefined) {
        res.sendStatus(400).send('Not authenticated');

        return;
      } else {
        firebaseConnector.verifyUser(token).then((val: firebaseAdmin.auth.DecodedIdToken) => {
          res.send(this.clients.map((value: Client) => { return value.json; }));
        }).catch((err: string) => {
          res.send(err);
        });
      }
    });

    this.ws.on('connection', (socket: socketIo.Socket) => {
      socket.on('Authenticate', (token: string) => {
        firebaseConnector.verifyUser(token).then((val: firebaseAdmin.auth.DecodedIdToken) => {
            this.clients.push(new Client(val.uid, socket));
            socket.emit('Authenticated', true);
        }).catch((err: string) => {
            logger.info(`Got invalid JWT from socket, error: ${err}`);
            socket.emit(`AuthError`, `Error authenticating connection: ${err}`);
            socket.disconnect();
        });
      });

      socket.on('disconnect', () => {
        const found: Client = this.clients.find((client: Client) => { return client.socket.id === socket.id; });
        if (found === undefined) {
          return;
        }
        found.room.removeClient(found);
        this.clients = this.clients.filter((cli: Client) => {
          return cli.uid !== found.uid;
        });
        logger.info(`Client: ${found.name} disconnected.`);
      });

      socket.on('JoinRoom', (roomId: string) => {
        const client: Client = this.clients.find((c: Client) => c.socket.id === socket.id);
        const room: Room = this.rooms.find((r: Room) => r.id === roomId);

        if (client === undefined) {
          socket.emit('Unauthenticated', 'Authenticate first.');
          logger.info(`Unauthenticated Request`);

          return;
        }

        logger.info(`Request to join room: ${roomId}, by client: ${client.name}`);
        socket.leaveAll();
        socket.join(roomId);

        if (!room) {
          const r: Room = new Room(roomId, this.ws.in(roomId));
          r.addClient(client);
          this.rooms.push(r);
        } else {
          room.addClient(client);
        }
      });
    });

    this.server.listen(port || process.env.PORT, async () => {
      // this is so stupidly wasteful but ascii art....
      logger.info(`\n${await asciiArt.font('Sync-Server  v2.0', 'Doom', 'magenta').toPromise()}`);
      logger.info(`Sync-Server listening on *:${port || process.env.PORT}`);
    });

    if (callback) {
      callback();
    }
  }

  public stop(callback?: () => void): void {
    this.server.close(callback);
  }

}

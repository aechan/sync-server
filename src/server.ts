/**
 * Configure and bootstrap server stack
 * Main entrypoint
 */
import express from 'express';
import http from 'http';
import io from 'socket.io';
import dotenv from 'dotenv';
import { FirebaseConnector, SnapItem } from './firebaseConnector';
import SocketRoomContext from './socketRoomContext';

export class Server {
  public static start() {
    // env vars available through process.env
    dotenv.config();

    // init our connection to firebase since we've loaded env vars
    FirebaseConnector.initialize();

    const app = express();
    const server = new http.Server(app);
    const ws = io(server);
    const roomCtxs: SocketRoomContext[] = [];

    app.get('/rooms/create', (req, res) => {
      const token: string = req.params["token"];
      const roomId: string = req.params["roomId"];
      if(roomId === "") res.sendStatus(400); // send bad request due to invalid param
      FirebaseConnector.verifyUser(token).then((valid) => {
        if(valid) {

        } else {
          res.sendStatus(401); // send unauthenticated due to invalid auth token
        }
      })
    });

    // get rooms from database and then setup the connection
    FirebaseConnector.hookRoomCtxFactory((room: SnapItem) => {
      roomCtxs.push(new SocketRoomContext(ws.of(room.key)));
    });

    server.listen(3000, () => {
      console.log('listening on *:3000');
    });
  }
}
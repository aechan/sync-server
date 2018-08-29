/**
 * Configure and bootstrap server stack
 * Main entrypoint
 */
import http from 'http';
import io from 'socket.io';
import dotenv from 'dotenv';
import { FirebaseConnector, SnapItem } from './firebaseConnector';
import SocketRoomContext from './socketRoomContext';
import WSEvents from './wsEvents';
export class Server {
  public static start() {
    // env vars available through process.env
    dotenv.config();

    // init our connection to firebase since we've loaded env vars
    FirebaseConnector.initialize();

    const server = http.createServer().listen(+process.env.PORT, process.env.HOSTNAME);
    const ws = io(server);
    const roomCtxs: SocketRoomContext[] = [];

    // initial landing place for socket connections
    ws.on('connection', (socket) => {
      // hook up all our websocket events to this socket connection
      WSEvents.configure(socket);
    });

    // get rooms from database and then setup the connection
    FirebaseConnector.hookRoomCtxFactory((room: SnapItem) => {
      roomCtxs.push(new SocketRoomContext(ws.of(room.key)));
    });
  }
}
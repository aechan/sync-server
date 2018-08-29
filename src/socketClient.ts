import io from 'socket.io';

/**
 * Serves as a wrapper to hold the client's
 * socket connection as well as caches additional
 * data about the client and has methods for storing/retriving
 * that data from Firebase
 */
export default class SocketClient {
    private socket: io.Socket;

    constructor(socket: io.Socket) {
        this.socket = socket;
    }

    get io(): io.Socket {
        return this.socket;
    }
}
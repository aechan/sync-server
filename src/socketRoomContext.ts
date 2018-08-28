import io from 'socket.io';
import WSEvents from './wsEvents';

export default class SocketRoomContext {
    private nsp: io.Namespace;
    
    constructor(nsp: io.Namespace) {
        this.nsp = nsp;
        this.nsp.on('connection', (socket) => {
            WSEvents.configure(socket);
        });
    }

    get id(): string {
        return this.nsp.name;
    }
}
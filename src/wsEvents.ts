import io from 'socket.io';
import events from './eventDefs';

/**
 * Sets up events for socket connections to listen for
 */
export default class WSEvents {
    public static configure(sock: io.Socket) {
        sock.on(events.CHAT, (data: string) => {

        });
    }
}
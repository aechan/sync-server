import io from 'socket.io-client';
import { Server } from '../src/server'

Server.start();

test("Connect and Create Room", async (done) => {
    const testRoom = "testRoom";
    const socket = io("http://localhost/" + testRoom);

    socket.on("connected", (data) => {
        console.log(data);
        expect(data).toBe(testRoom);
        done();
    });
}, 5000);

import * as firebase from 'firebase-admin';
import { resolve } from 'dns';
const serviceAccount = require('../firebase-admin-serviceaccount.json');
export type SnapItem = { val: any, key: string };

/**
 * Converts a Google snapshot to simple typescript array
 * @param snapshot snapshot to convert to array
 */
export const snapshotToArray = (snapshot: firebase.database.DataSnapshot): SnapItem[] => {
    var returnArr: SnapItem[] = [];

    snapshot.forEach((childSnapshot) => {
        var item: SnapItem = {
            val: childSnapshot.val(),
            key: childSnapshot.key
        };
        
        returnArr.push(item);
        return true;
    });

    return returnArr;
};

/**
 * Exposes an API to connect to firebase.
 * Firebase should never be used directly outside
 * of this class
 */
export class FirebaseConnector {
    private static initialized: boolean = false;

    /**
     * Static initializer
     * Load our firebase connection data from env
     * and initialize firebase instance
     */
    public static initialize() {
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL: "https://sync-9192c.firebaseio.com"
        });
        this.initialized = true;
    }

    /**
     * Asynchronously hook for getting list of rooms and their data from firebase.
     * 
     * Fires the callback every time a new room is added to db
     */
    public static hookRoomCtxFactory(callback: (room: SnapItem) => any): void {
        if(!this.initCheck()) return;
        firebase.database().ref('/rooms/').on('child_added', (snap) => {
            callback({ val: snap.val(), key: snap.key });
        });
    }

    /**
     * Guards against calling methods connecting
     * to the firebase context without it being initialized
     */
    private static initCheck(): boolean {
        if(!this.initialized) {
            console.error("Called a Firebase connection method without initializing firebase");
        }
        return this.initialized;
    }

    /**
     * Asynchronously verifies a JWT auth token and returns
     * whether it is valid or not.
     * @param token ID token recieved from http request
     */
    public static verifyUser(token: string): Promise<{valid: boolean, decoded: firebase.auth.DecodedIdToken}> {
        return new Promise<{valid: boolean, decoded: firebase.auth.DecodedIdToken}>((resolve, reject) => {
            if(!this.initCheck()) reject("Firebase was not initialized.");
            firebase.auth().verifyIdToken(token, true).then((decoded) => {
                resolve({
                    valid: true,
                    decoded: decoded
                });
            }).catch((err) => {
                resolve({
                    valid: false,
                    decoded: undefined
                });
            });
        });
    }

    /**
     * Async handles an user requesting to join a room and
     * if the request is validated, the user will be assigned to
     * the relevant room on the firebase database.
     * @param token user's JWT token from firebase auth.
     * @returns true if user successfully joined, false if not
     */
    public static joinRoom(token: string, roomId: string): Promise<boolean> {
        return new Promise<boolean>((res, rej) => {
            this.verifyUser(token).then((resp) => {
                if(resp.valid) {
                    firebase.database().ref('/rooms/'+roomId+'/users/').push({
                        user: resp.decoded.uid
                    });
                    res(true);
                } else {
                    res(false);
                }
            }).catch((err) => {
                rej(err);
            });
        })
    }
}


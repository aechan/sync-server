import * as firebase from 'firebase-admin';
import { resolve } from 'dns';
const serviceAccount = require('../firebase-admin-serviceaccount.json');
export type SnapItem = { val: any, key: string };

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
    public static verifyUser(token: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            firebase.auth().verifyIdToken(token, true).then((decoded) => {
                resolve(true);
            }).catch((err) => {
                resolve(false);
            });
        });
    }
}


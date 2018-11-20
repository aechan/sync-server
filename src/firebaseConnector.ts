/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/

import * as firebase from 'firebase-admin';
import { serviceAccount } from './serviceAccount';
import { logger } from './logger';
import { Room } from './Room';
export type SnapItem = { val: {}; key: string };

export const snapshotToArray: (snapshot: firebase.database.DataSnapshot) => SnapItem[]
     = (snapshot: firebase.database.DataSnapshot): SnapItem[] => {
    const returnArr: SnapItem[] = [];

    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {
        const item: SnapItem = {
            val: <{}>childSnapshot.val(),
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
export const firebaseConnector: {
        initialized: boolean;
        initialize(): void;
        getRooms(): {};
        initCheck(): boolean;
        verifyUser(token: string): Promise<firebase.auth.DecodedIdToken>;
        getUserInfo(uid: string): Promise<{ imageURL: string; displayName: string }>;
    } = {
    initialized: false,

    initialize(): void {
        firebase.initializeApp({
            credential: firebase.credential.cert(<firebase.ServiceAccount>serviceAccount),
            databaseURL: 'https://sync-9192c.firebaseio.com'
        });
        firebaseConnector.initialized = true;
    },

    getRooms(): Room[] {
        return null;
    },

    /**
     * Guards against calling methods connecting
     * to the firebase context without it being initialized
     */
    initCheck(): boolean {
        if (!firebaseConnector.initialized) {
            logger.error('Called a Firebase connection method without initializing firebase');
        }

        return firebaseConnector.initialized;
    },

    /**
     * Asynchronously verifies a JWT auth token and returns
     * whether it is valid or not.
     * @param token ID token recieved from http request
     */
    async verifyUser(token: string): Promise<firebase.auth.DecodedIdToken> {
        return new Promise<firebase.auth.DecodedIdToken>(
            (resolve: (value?: firebase.auth.DecodedIdToken | PromiseLike<firebase.auth.DecodedIdToken>) => void,
             reject: (reason?: string) => void): void => {
            firebase.auth().verifyIdToken(token, true).then((decoded: firebase.auth.DecodedIdToken) => {
                resolve(decoded);
            }).catch((err: string) => {
                reject(err);
            });
        });
    },

    async getUserInfo(uid: string): Promise<{ imageURL: string; displayName: string }> {
        const { displayName, photoURL } = await firebase.auth().getUser(uid);

        return {
            displayName: displayName,
            imageURL: photoURL
        };
    }
};

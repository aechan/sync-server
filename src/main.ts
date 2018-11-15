/*******************************************************
 * Copyright (C) 2018 Alec Chan - All Rights Reserved
 * Unauthorized copying of this file,
 * via any medium is strictly prohibited
 * Alec Chan <me@alecchan.io> November, 2018
 *******************************************************/
/**
 * Entrypoint
 */
import { Server } from './Server';

const server: Server = new Server();

server.start();

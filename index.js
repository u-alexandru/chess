import cors from "cors";
import express, { json } from "express";
import expressWs from 'express-ws';
import WebSocket from 'ws';
import createUser from "./board/createUser.js";
import router from "./board/form.js";

import makeMove from "./board/makeMove.js";
import roomCreateRoute from "./board/roomController.js";
import roomJoinRoute from "./board/roomJoin.js";
import roomSelectColor from "./board/roomSelectColor.js";

const app = express();
const wsInstance = expressWs(app).getWss();
// use cors to allow cross origin resource sharing
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));

// Store the active WebSocket routes
const activeRoutes = new Map();

app.use(json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.use('/images', express.static('images'));
app.use('/board/form', router);
app.use('/board/room/create', roomCreateRoute);
app.use('/board/room/join', roomJoinRoute);
app.use('/board/createUser', createUser);
app.use('/board/roomselectcolor', roomSelectColor);
app.use('/board/makemove', makeMove);

// Function to create a new WebSocket route
const createWebSocketRoute = (route) => {
    app.ws(route, (ws, req) => {
        // Handle incoming WebSocket connection
        ws.on('message', (message) => {
            // Handle incoming messages
            console.log(`Received message on route ${route}: ${message}`);
        });

        // Send a welcome message to the client
        ws.send(`Connected to WebSocket server on route ${route}`);

        // Store the WebSocket connection instance
        activeRoutes.set(route, ws);
    });
};

// Function to send a message through a WebSocket route
const sendWebSocketMessage = (route, message) => {
    const ws = activeRoutes.get(route);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    }
};

// Function to delete a WebSocket route
const deleteWebSocketRoute = (route) => {
    app._router.stack = app._router.stack.filter((layer) => {
        if (layer.route && layer.route.path === route) {
            return false;
        }
        return true;
    });

    activeRoutes.delete(route);
};

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));

export { createWebSocketRoute, deleteWebSocketRoute, sendWebSocketMessage, wsInstance };

import { Chess } from 'chess.js';
import express from "express";
import mysql from "mysql";
import database from "../config/config.js";
import { sendWebSocketMessage } from "../index.js";
//import { sendWebSocketMessage } from "../index.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const indexToNotation = (index) => {
    const column = String.fromCharCode(97 + (index % 8)); // Convert column index to letter (a-h)
    const row = 8 - Math.floor(index / 8); // Convert row index to number (1-8)
    return `${column}${row}`;
};

//sendWebSocketMessage('asd');
//const fen = 'FEN_NOTATION_HERE';
//const chess = new Chess(fen);
const makeMove = express.Router();

makeMove.use(async (req, res) => {
    console.log(req.body.room.passkey);
    console.log(indexToNotation(req.body.origin));
    //find room with passkey
    con.query(`SELECT * FROM rooms WHERE passkey = '${req.body.room.passkey}'`, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            res.json({ error: "Room does not exist" });
        } else {
            const chess = new Chess(result[0].board);
            // check if checkmate
            try {
                let move = chess.move({ from: indexToNotation(req.body.origin), to: indexToNotation(req.body.destination) });
                let newChessState = new Chess(move.after);
                if (newChessState.inCheck()) {
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "gameStatus", "message": "Check"}`);
                }
                if (newChessState.isCheckmate()) {
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "gameStatus", "message": "Checkmate"}`);
                }
                if (newChessState.isDraw()) {
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "gameStatus", "message": "Draw"}`);
                }
                if (newChessState.isInsufficientMaterial()) {
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "gameStatus", "message": "Insufficient Material"}`);
                }
                if (newChessState.isGameOver()) {
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "gameStatus", "message": "Game Over"}`);
                }

                con.query(`UPDATE rooms SET board = '${move.after}' WHERE passkey = '${req.body.room.passkey}'`, function (err, result) {
                    if (err) throw err;
                    console.log('after', move.after);
                    sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "update", "newFen": "${move.after}"}`);
                    res.json({ message: "Valid", board: move.after });
                });
            } catch (error) {
                console.log(error);
                sendWebSocketMessage(`/ws/${req.body.room.id}`, `{"type": "message", "message": "Invalid move"}`);
                res.json({ message: "Invalid move", board: result[0].board });
            }
        }
    });

});

export default makeMove;
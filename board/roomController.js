import express from "express";
import mysql from "mysql";
import database from "../config/config.js";

import { createWebSocketRoute } from "../index.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const roomCreateRoute = express.Router();

roomCreateRoute.use(async (req, res) => {

    con.query("SHOW TABLES LIKE 'rooms'", function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            console.log("Table does not exist");
            con.query("CREATE TABLE rooms (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, passkey VARCHAR(255) NOT NULL, board VARCHAR(255) NOT NULL, white_id VARCHAR(255), black_id VARCHAR(255), winner VARCHAR(255))", function (err, result) {
                if (err) throw err;
                // add default board to table with FEN notation for starting position
                console.log("Table created");
            });
        } else {
            console.log("Table exists");
        }
        // get last id from rooms table +1 or 1 if table is empty
        con.query("SELECT id FROM rooms ORDER BY id DESC LIMIT 1", function (err, result) {
            if (err) throw err;
            let id = 1;
            if (result.length != 0) {
                id = result[0].id + 1;
            }
            // create unique token for room length 6
            let passkey = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 9; i++) {
                passkey += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            let defaultBoard = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            con.query("SELECT board FROM boards WHERE name = 'default'", function (err, result) {
                if (err) throw err;
                defaultBoard = result[0].board;
            });

            con.query(`INSERT INTO rooms (name, passkey, board) VALUES ('Room_${id}', '${passkey}' ,'${defaultBoard}')`, function (err, result) {
                if (err) throw err;
                createWebSocketRoute(`/ws/${id}`);
                res.json({ id: id, passkey: passkey, name: `Room_${id}`, board: defaultBoard, white_id: null, black_id: null, winner: null });
                // generate random number from 0 to 10
                let rnd = Math.random(0, 10);
            });
        });

    });
});

export default roomCreateRoute;
import express from "express";
import mysql from "mysql";

import database from "../config/config.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const roomJoinRoute = express.Router();

roomJoinRoute.use(async (req, res) => {
    const passCode = req.body.passcode;
    // find room with passcode
    con.query(`SELECT * FROM rooms WHERE passkey = '${passCode}'`, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            res.json({ error: "Room does not exist" });
        } else {
            res.json({ id: result[0].id, passkey: result[0].passkey, name: result[0].name, board: result[0].board, white_id: result[0].white_id, black_id: result[0].black_id, winner: result[0].winner });
        }
    });
});

export default roomJoinRoute;
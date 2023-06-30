import express from "express";
import mysql from "mysql";
import database from "../config/config.js";
import { sendWebSocketMessage } from "../index.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const roomSelectColor = express.Router();

roomSelectColor.use(async (req, res) => {
    console.log('here');
    const data = req.body;
    const user = JSON.parse(data.token);
    // Find Room with id
    con.query(`SELECT * FROM rooms WHERE id = '${data.room.id}'`, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            res.json({ error: "Room does not exist" });
        } else {
            if (data.color == "white") {
                if (result[0].white_id == null || result[0].white_id == user.token) {
                    if (result[0].black_id == user.token) {
                        res.json({ error: "You are already black" });
                        return;
                    }
                    con.query(`UPDATE rooms SET white_id = '${user.token}' WHERE id = '${data.room.id}'`, function (err, result) {
                        if (err) throw err;
                        sendWebSocketMessage(`/ws/${data.room.id}`, '{"type": "message", "message": "White Joined"}');
                        res.json({ success: "Ok", board: data.room.board });
                    });
                }
            } else if (data.color == "black") {
                if (result[0].black_id == null || result[0].black_id == user.token) {
                    if (result[0].white_id == user.token) {
                        res.json({ error: "You are already white" });
                        return;
                    }
                    con.query(`UPDATE rooms SET black_id = '${user.token}' WHERE id = '${data.room.id}'`, function (err, result) {
                        if (err) throw err;
                        console.log('black');
                        sendWebSocketMessage(`/ws/${data.room.id}`, '{"type": "message", "message": "Black Joined"}');
                        res.json({ success: "Ok", board: data.room.board });
                    });
                }
            }
        }
    });
});

export default roomSelectColor;
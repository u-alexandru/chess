import express from "express";
import mysql from "mysql";
import database from "../config/config.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
// check if table boards exists in database

const router = express.Router();

router.use(async (req, res) => {
    con.query("SELECT board FROM boards WHERE name = 'default'", function (err, result) {
        if (err) throw err;
        res.json({ FEN: result[0].board })
    });
});

export default router;
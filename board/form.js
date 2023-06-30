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
con.query("SHOW TABLES LIKE 'boards'", function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
        console.log("Table does not exist");
        con.query("CREATE TABLE boards (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), passkey VARCHAR(255) ,board VARCHAR(255) NOT NULL)", function (err, result) {
            if (err) throw err;
            // add default board to table with FEN notation for starting position
            con.query("INSERT INTO boards (name, board) VALUES ('default', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')", function (err, result) {
                if (err) throw err;
                console.log("Default board added");
            });
            console.log("Table created");
        });
    } else {
        console.log("Table exists");
    }
});


const router = express.Router();

router.use(async (req, res) => {
    con.query("SELECT board FROM boards WHERE name = 'default'", function (err, result) {
        if (err) throw err;
        res.json({ FEN: result[0].board })
    });
});

export default router;
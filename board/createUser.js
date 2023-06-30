
import express from "express";
import mysql from "mysql";
import TokenGenerator from 'uuid-token-generator';

import database from "../config/config.js";

// create table in mysql named boards
const con = mysql.createConnection(database);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


const createUser = express.Router();

createUser.use(async (req, res) => {
    const tokgen = new TokenGenerator(256, TokenGenerator.BASE62); // Default is a 128-bit token encoded in base58
    const username = req.body.username;
    const newUser = {
        name: username,
        token: tokgen.generate(),
    }

    res.json({ data: JSON.stringify(newUser) });
});

export default createUser;

// defines
var express = require('express');
const fs = require('fs');
var WebSocketServer = require("ws").Server
var app = express()


// send frontend index on root
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/frontend/index.html")
})

// using static works, I guess ¯\_(ツ)_/¯
app.use(express.static(__dirname + "/frontend/"))

var server = require('http').createServer(app);
var wss = new WebSocketServer({server: server, path: '/message'})

wss.on('connection', function open(ws) {
    ws.on('message',
    (msg) => {
            let wMsg = JSON.parse(msg.toString());

            for (let val of wMsg[1]) {
                let fnO = wMsg[0][String(val[0])].fName;
                let lnO = wMsg[0][String(val[0])].lName;
                let emailO = wMsg[0][String(val[0])].email;
                let uidO = wMsg[0][String(val[0])].UID;

                let fnR = wMsg[0][String(val[1])].fName;
                let lnR = wMsg[0][String(val[1])].lName;
                let emailR = wMsg[0][String(val[1])].email;
                let uidR = wMsg[0][String(val[1])].UID;

                console.log("User " + fnO + ' ' + lnO + " at " + emailO + ' will give a gift to user ' + fnR + ' ' + lnR + " at " + emailR + ".");

                let fname = fnO + lnO + uidO + ".txt";
                fs.writeFile(__dirname + "/data/" + fname, fnR + ' ' + lnR + " at " + emailR, 'utf-8', function () { });
            }
        }
);
})

server.listen(80)
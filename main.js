import net from "net";
import { Player } from "./player.js";
import { networkInterfaces } from "os";
import express from "express";
import fs from "fs";
import { WebSocketServer } from "ws";
import * as cp from "child_process";
import { loadImage, createCanvas } from "canvas";
var app = express();

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("連接");

  const sendImage = setInterval(() => {
    ws.send(nowImage);
  }, 1000 / 50);

  ws.on("close", () => {
    console.log("斷開連接");
  });
});

var nowImage = "";

const nets = networkInterfaces();
const ip = {}; // Or just '{}', an empty object
for (const name of Object.keys(nets)) {
  // get IP of this device
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!ip[name]) {
        ip[name] = [];
      }
      ip[name].push(net.address);
    }
  }
}

let gameRoom = new Map();

let count = 0;

function getFromClient(socket, data) {
  try {
    const clientJson = JSON.parse(data);

    switch (clientJson.type) {
      case "EGR":
        //Enter Game Room
        console.log(clientJson);
        console.log(
          "Player " + clientJson.name + " has entered the game room."
        );
        let id = gameRoom.size;
        console.log("Player " + clientJson.name + " has ID " + id);
        let player = new Player(clientJson.name, id, socket);
        gameRoom.set(socket.remoteAddress, player);
        sendToClient(socket, "GTI", {
          // Get Temporary ID
          id: id,
        });
        break;
      case "F":
        // Receive Frame from client
        if (count % 100 == 0) {
          let Base64_JPEG = clientJson.Base64_JPEG;
          nowImage = Base64_JPEG;
          fs.writeFileSync("./image.jpg", Base64_JPEG, "base64");
          cp.exec(
            "python openpose_python.py --image_dir ../../../../MyProject/biubiuServer --write_json",
            { cwd: "../../openpose/build/examples/tutorial_api_python" },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
            }
          );
        }
        count++;
        //console.log("Frame " + count + " received.");
        break;
      case "S":
        // shoot
        console.log("shoot at x: " + clientJson.x + " y: " + clientJson.y);
        break;
    }
  } catch (e) {
    console.log(e);
  }
}

function sendToClient(socket, type, json) {
  json["type"] = type;
  socket.write(JSON.stringify(json) + "\n");
}

var server = net
  .createServer(function (socket) {
    console.log("Player " + socket.remoteAddress + " has connected.");
    let buffer = "";
    socket.on("data", function (chunk) {
      let str = chunk.toString();
      while (str.indexOf("\n") != -1) {
        buffer += str.substring(0, str.indexOf("\n"));
        getFromClient(socket, buffer);
        buffer = "";
        str = str.substring(str.indexOf("\n") + 1);
      }
      buffer += str;
    });
  })
  .listen(1337, function (err) {
    if (err) {
      console.log("error");
    } else {
      console.log("listening");
      console.log(ip);
    }
  });

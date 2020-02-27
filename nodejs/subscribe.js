const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");
const fs = require('fs');
const NodeRSA = require('node-rsa');
const key = new NodeRSA(fs.readFileSync('key.private'));

global.fetch = require('node-fetch')
global.WebSocket = require('ws')

const telosTrxStatus = () => {
  const messageBody = {
    "apikey": "dkfjsldkfjsdlfjs",
    "event": "subscribe",
    "type": "get_actions",
    "data": {
      "account": "messengerbus",
      "actions": ["pub"]
    }
  }
  const socket = new WebSocket("wss://testnet.telos.eostribe.io/streaming")

  socket.onopen = () => {
    socket.send(JSON.stringify(messageBody));
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const ipfs_hash = JSON.parse(data.action.act.data).ipfs_hash;
    console.log ('Received IPFS Hash :', ipfs_hash);

    ipfs.get(ipfs_hash).then (function (receivedData) {
      const decryptedData = key.decrypt(receivedData);
      console.log(`Decrypted Data: ${decryptedData}`);
    });

    // const signature = key.sign(content);
    // console.log (`Signed Data: ${signature}`);

    // const verify = key.verify(retrieved, signature);
    // console.log (`Verified Data: ${verify}`);
  }
  socket.onclose = (event) => {
    console.log("Telos socket connection closed:" + event.data)
  }
  socket.onerror = function (error) {
    console.log("Telos websocket got error: " + error.message)
  }
}

telosTrxStatus();

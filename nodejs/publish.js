var faker = require('faker');
const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");
const NodeRSA = require('node-rsa');
const fs = require('fs');
const MESSENGER = "messengerbus";

const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig");
const fetch = require("node-fetch");
const { TextEncoder, TextDecoder } = require("util");
const defaultPrivateKey = process.env.PRIVATE_KEY;
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

async function sendtrx (host, contract, action, authorizer, data) {
  const rpc = new JsonRpc(host, { fetch });
  const api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});
  const actions = [{account: contract,name: action,authorization: [{actor: authorizer, permission: "active"}],data: data}];
  const result = await api.transact({actions: actions}, {blocksBehind: 3, expireSeconds: 30});
  console.log("Transaction Successfull : ", result.transaction_id);
}

const main = async () => {

  const key = new NodeRSA(fs.readFileSync('key.private'));

  const content = faker.helpers.createTransaction();
  console.log("Encrypting :", JSON.stringify(content, null, 2));

  const encryptedData = key.encrypt(content);
  console.log('Size of Encrypted Data: ', JSON.stringify(encryptedData).length);

  const cid = await ipfs.add(encryptedData);
  console.log("IPFS cid:", cid);

  await sendtrx("https://jungle2.cryptolions.io", MESSENGER, "pub", 
    MESSENGER, { "ipfs_hash":cid, "memo":"memo" });
}

main()
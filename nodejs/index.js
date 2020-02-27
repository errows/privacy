var faker = require('faker');
const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const NodeRSA = require('node-rsa');

(async () => {

const key = new NodeRSA({b: 512});
const content = faker.helpers.createTransaction();
console.log (`Encrpyting: ${content}`);

const encryptedData = key.encrypt (content);
console.log ('typeof encryptedData: ', typeof encryptedData);
console.log (`Encrypted Data: ${encryptedData}`);

// add this document to IPFS
const cid = await ipfs.add(encryptedData);

// this document/object is saved in IPFS under the following CID
console.log("IPFS cid:", cid);

// now we can retrieve this object
const retrievedEncryptedData = await ipfs.get(cid);
console.log ('typeof retrievedEncryptedData: ', typeof retrievedEncryptedData);
console.log (`Retreived Encrypted Data:${retrievedEncryptedData}`);


// const signature = key.sign(content);
// console.log (`Signed Data: ${signature}`);

// const verify = key.verify(retrieved, signature);
// console.log (`Verified Data: ${verify}`);

const decryptedData = key.decrypt(retrievedEncryptedData);
console.log (`Decrypted Data: ${decryptedData}`);

})();
// (async () => {

//     const doc = JSON.stringify(faker.helpers.createTransaction());
  
//     // add this document to IPFS
//     const cid = await ipfs.add(doc);
  
//     // this document/object is saved in IPFS under the following CID
//     console.log("IPFS cid:", cid);
  
//     // now we can retrieve this object
//     console.log(await ipfs.cat(cid));
  
//   })();

// let keys = QuickEncrypt.generate(2048) // Use either 2048 bits or 1024 bits.
 
// console.log(keys.public) // Public Key that has been generated.
 
// console.log(keys.private) // Private Key that has been generated.
const qrcode = require("qrcode-terminal");
const { MessageMedia } = require("whatsapp-web.js");
const { Client, RemoteAuth } = require("whatsapp-web.js");

// Require database
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

const clients = {};

function startClient(id, callback) {
  // Add a callback function
  mongoose.connect(process.env.MONGO).then(() => {
    const store = new MongoStore({ mongoose: mongoose });

    clients[id] = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
      clientId: id,
    });
  });

  clients[id].initialize().catch((err) => {
    console.error("Client initialization error:", err);
    callback(null, err); // Call the callback with the error
  });

  clients[id].on("qr", (qr) => {
    console.log(qr);
    qrcode.generate(qr, { small: true });
    callback(qr); // Call the callback with the QR code
  });

  clients[id].on("ready", () => {
    console.log("Client is ready!");
    callback(null); // Signal successful initialization
  });

  clients[id].on("message", async (msg) => {
    try {
      if (msg.from != "status@broadcast") {
        const contact = await msg.getContact();
        console.log(id, contact, msg.from);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

function sendMessage(phoneNumber, message, clientId, file) {
  try {
    if (file) {
      const messageFile = new MessageMedia(
        file.mimetype,
        file.buffer.toString("base64")
      );
      clients[Number(clientId)].sendMessage(phoneNumber, messageFile);
    } else {
      clients[clientId]
        .sendMessage(phoneNumber, message)
        .then(console.log("Message sent successfully to:", phoneNumber));
    }
  } catch (error) {
    console.log({error});
  }
}

module.exports = { startClient, sendMessage };

const { Client, LocalAuth } = require("whatsapp-web.js")
const qrcode = require("qrcode-terminal")
const { MessageMedia } = require("whatsapp-web.js")


const clients = {}

function startClient(id, callback) { // Add a callback function
    clients[id] = new Client({
      authStrategy: new LocalAuth({
        clientId: id,
      }),
      webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2407.3.html`
      }
    });
  
    clients[id].initialize().catch(err => {
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
        if (process.env.PROCCESS_MESSAGE_FROM_CLIENT && msg.from != "status@broadcast") {
          const contact = await msg.getContact();
          console.log(contact, msg.from);
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
  
function sendMessage(phoneNumber, message, clientId, file) {
    if(file) {
        const messageFile = new MessageMedia(file.mimetype, file.buffer.toString('base64'))
        clients[Number(clientId)].sendMessage(phoneNumber, messageFile)
    } else {
        clients[clientId].sendMessage(phoneNumber, message);
    }
}

module.exports = { startClient, sendMessage }
const express = require("express");
const router = new express.Router();
const { startClient, sendMessage } = require("../services/WhatsappClient");
const multer = require("multer");
const upload = multer();
const QRCode = require("qrcode");

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/message", upload.single("file"), (req, res) => {
  const file = req.file;
  const clientId = req.body.clientId;
  sendMessage(req.body.phoneNumber, req.body.message, clientId, file);
  res.send();
});

router.get("/:id/start", (req, res) => {
  const clientId = req.params.id;
  startClient(clientId, (qr, err) => {
    // Pass a callback function
    if (err) {
      console.error("Error starting client:", err);
      return res.status(500).send("Error starting client");
    }

    if (qr) {
      // Check if qr is defined (it might be null if initialization was successful)
      QRCode.toDataURL(qr, (err, url) => {
        if (err) return res.status(500).send("Error generating QR code");
        res.send(`<img src="${url}">`);
      });
    } else {
      // Handle the case where the client is ready directly (no QR code)
      res.send("Client is ready or starting..."); // Or redirect, etc.
    }
  });
});
module.exports = router;

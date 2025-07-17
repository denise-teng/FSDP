const express = require("express");
const cors = require("cors");
const path = require("path");
const wbm = require("./wbm");  // Import the WhatsApp logic

const app = express();

// Middleware for JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// POST route for WhatsApp message sending
// Generate QR code
app.post("/api/qr", (req, res) => {
  wbm
    .start({ qrCodeData: true, session: false, showBrowser: false })
    .then((qrCodeData) => {
      res.send(qrCodeData); // Send QR code to frontend
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error generating QR code");
    });
});

// Send message (call this AFTER QR is scanned)
app.post("/api/send", (req, res) => {
  const { phone, msg } = req.body;
  const phones = [phone];
  const message = msg;

  wbm.send(phones, message)
    .then(() => res.send("Message sent!"))
    .catch((err) => res.status(500).send("Error sending message"));
});

// Serve the React frontend
app.use(express.static(path.join(__dirname, "./client/build")));

// Fallback route for all other requests (to serve the React app)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

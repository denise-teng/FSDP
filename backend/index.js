import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as wbm from "./lib/wbm.js"; // ✅ ES module import

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/api/qr", async (req, res) => {
  try {
    const qrData = await wbm.start();
    res.send(qrData);
  } catch (err) {
    console.error("QR Generation Error:", err);
    res.status(500).send("Error generating QR code");
  }
});

app.post("/api/wait-scan", async (req, res) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Scan timeout")), 300000);
    });

   

    res.send({ status: "scanned" });
  } catch (err) {
    console.error("Scan Error:", err.message);
    res.status(500).send(err.message);
  }
});

app.post("/api/send", async (req, res) => {
  const { phone, msg } = req.body;
  try {
    await wbm.send([phone], msg);
    res.send("Message sent!");
  } catch (err) {
    console.error("Send Error:", err);
    res.status(500).send("Error sending message");
  } finally {
    await wbm.end(); // Clean up session
  }
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

import React, { useState } from "react";
import axios from "axios";
var QRCode = require("qrcode.react");

const App = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [msg, setMessage] = useState("");
  const [qrcode, setQRCode] = useState(null);

  const getQRCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api", { phone, msg });
      setQRCode(res.data);  // Assuming res.data contains the QR code data
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div>
        <label>Phone Number:</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label>Message:</label>
        <input value={msg} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button onClick={getQRCode}>Get QRCode</button>

      {loading && <p>Waiting for QRCode...</p>}

      {!loading && qrcode && (
        <div style={{ margin: "100px" }}>
          <QRCode value={qrcode} />
        </div>
      )}
    </div>
  );
};

export default App;

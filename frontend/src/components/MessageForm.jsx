import React, { useState } from "react";
import axios from "axios";
import { QRCode } from 'react-qr-code';

const MessageForm = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [msg, setMessage] = useState("");
  const [qrcode, setQRCode] = useState(null);

  const getQRCode = async () => {
  setLoading(true);
  try {
    // Step 1: Get QR code
    const qrRes = await axios.post("/api/qr");
    setQRCode(qrRes.data);

    // Step 2: After user scans QR, send the message
    await axios.post("/api/send", { phone, msg });
    alert("Message sent!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to send message. Check console.");
  }
  setLoading(false);
};
  return (
    <div>
      <div>
        <label style={{ color: 'black' }}>Phone Number:</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          style={{ color: 'black' }}  // Text inside the input will be black
        />
      </div>
      <div>
        <label style={{ color: 'black' }}>Message:</label>
        <input
          value={msg}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          style={{ color: 'black' }}  // Text inside the input will be black
        />
      </div>
      <button onClick={getQRCode}>Get QR Code</button>

      {loading && <p style={{ color: 'black' }}>Waiting for QR Code...</p>}

      {!loading && qrcode && (
        <div style={{ margin: "100px" }}>
          <QRCode value={qrcode} />
        </div>
      )}
    </div>
  );
};

export default MessageForm;

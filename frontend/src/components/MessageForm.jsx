import { useState } from "react";
import axios from "axios";
import QRCode from 'react-qr-code';

const MessageForm = () => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [msg, setMessage] = useState("");
  const [qrData, setQRData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const getQRCode = async () => {
    setLoading(true);
    try {
      const qrRes = await axios.post("http://localhost:5000/api/wait-scan");

      setQRData(qrRes.data);
      setIsScanning(true);
      
      // Wait for scan confirmation
   
      alert("QR Code scanned successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.error || error.message || "Failed in QR process");

    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const sendMessage = async () => {
    if (!phone || !msg) return alert("Missing phone or message");
    
    try {
      setLoading(true);
      await axios.post("/api/send", { phone, msg });
      alert("Message sent!");
    } catch (error) {
      console.error("Send Error:", error);
      alert(error.response?.data || "Send failed");
    } finally {
      setLoading(false);
    }
  };

  return (

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {/* Phone Number Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Phone Number (with country code):
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 15551234567"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            color: 'black'
          }}
        />
      </div>

          <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Message:
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minHeight: '100px',
            color: 'black'
          }}
        />
      </div>
      
      <button 
        onClick={getQRCode} 
        disabled={loading || isScanning}
      >
        {isScanning ? "Waiting for scan..." : "Get QR Code"}
      </button>

      {qrData && (
  <div style={{ 
    background: 'white', 
    padding: '20px',
    margin: '20px auto',
    maxWidth: '300px'
  }}>
    <img src={qrData} alt="QR Code" style={{ width: 256, height: 256 }} />
    <p style={{ marginTop: '10px' }}>
      Scan in WhatsApp to Linked Devices
    </p>
  </div>
)}



      <button
        onClick={sendMessage}
        disabled={!qrData || loading}
      >
        Send Message
      </button>

 
)

    </div>

    
  );
};

export default MessageForm;
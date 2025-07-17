const wbm = require("wbm");  // Ensure you've installed wbm using npm

module.exports = {
  start: (options) => {
    return wbm.start(options);  // Starts the session and returns QR code data
  },
  waitQRCode: () => {
    return wbm.waitQRCode();  // Wait for the QR code to be scanned
  },
  send: (phones, message) => {
    return wbm.send(phones, message);  // Send the message
  },
  end: () => {
    return wbm.end();  // Ends the session after sending
  }
};

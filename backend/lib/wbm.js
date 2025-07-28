// backend/lib/wbm.js
import wbm from 'wbm';

export async function start(options = {}) {
  return new Promise((resolve, reject) => {
    wbm.start({
      qrCodeData: true,
      session: true,  // Enable session persistence
      showBrowser: false,
      ...options
    }).then((qrData) => {
      const qrUrl = typeof qrData === 'object' ? qrData.url : qrData;
      if (!qrUrl.includes('web.whatsapp.com')) {
        reject(new Error('Invalid WhatsApp QR data'));
        return;
      }
      resolve(qrUrl);
    }).catch(reject);
  });
}



export async function send(phones, message) {
  try {
    await wbm.send(phones, message);
    return true;
  } catch (e) {
    throw new Error('Message sending failed: ' + e.message);
  }
}

export function end() {
  return wbm.end();
}

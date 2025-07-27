import fs from 'fs';
import path from 'path';

const FLAGGED_PATH = path.join(process.cwd(), 'storage', 'flaggedMessages.json');
const TIMES_PATH = path.join(process.cwd(), 'storage', 'recommendedTimes.json');

// Ensure storage directory exists
for (const p of [FLAGGED_PATH, TIMES_PATH]) {
  if (!fs.existsSync(path.dirname(p))) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  }
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(p === FLAGGED_PATH ? [] : {}));
  }
}

// ---------- RECOMMENDED TIMES ----------
function saveRecommendedTimes(times) {
  try {
    fs.writeFileSync(TIMES_PATH, JSON.stringify(times, null, 2));
  } catch (err) {
    console.error('Error saving recommended times:', err);
  }
}

function getRecommendedTimes() {
  try {
    const data = fs.readFileSync(TIMES_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading recommended times:', err);
    return {};
  }
}

// ---------- FLAGGED MESSAGES ----------
function readMessages() {
  try {
    const data = fs.readFileSync(FLAGGED_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading messages:', err);
    return [];
  }
}

function writeMessages(messages) {
  try {
    fs.writeFileSync(FLAGGED_PATH, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error writing messages:', err);
  }
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function saveFlaggedMessages(newMessages) {
  const existingMessages = readMessages();

  const existingKeys = new Set(
    existingMessages.map(m =>
      `${(m.contact ?? '').toLowerCase()}:${normalize(m.text)}`
    )
  );

  const uniqueNewMessages = newMessages.filter(
    m => !existingKeys.has(`${(m.contact ?? '').toLowerCase()}:${normalize(m.text)}`)
  );

  const updated = [...existingMessages, ...uniqueNewMessages];
  writeMessages(updated);
  return updated;
}

async function getFlaggedMessages() {
  return readMessages();
}

async function deleteMessageById(messageId) {
  const messages = readMessages();
  const filtered = messages.filter(m => m.id !== messageId);
  writeMessages(filtered);
}

async function loadMessages() {
  return getFlaggedMessages();
}

export {
  saveRecommendedTimes,
  getRecommendedTimes,
  saveFlaggedMessages,
  getFlaggedMessages,
  deleteMessageById,
  loadMessages
};

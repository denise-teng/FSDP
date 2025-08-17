import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import CreateEventForm from "./CreateEventForm";

const normalizePhone = (raw, defaultCc = "+65") => {
  if (!raw) return "";
  let p = String(raw).trim().replace(/[^\d+]/g, ""); // keep + and digits
  if (p.startsWith("+")) return p;                   // already E.164-ish
  if (/^\d{8}$/.test(p) && defaultCc) return `${defaultCc}${p}`; // SG local → +65
  if (/^\d{9,15}$/.test(p)) return `+${p}`;          // bare digits, assume has CC
  return p;                                          // fallback (don’t block)
};
const toHHMM = (s) => {
  if (!s) return "";
  // trims + case-insensitive
  const t = String(s).trim().toUpperCase();
  // 24h like "15:30"
  const m24 = t.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (m24) return `${m24[1].padStart(2,"0")}:${m24[2]}`;
  // 12h like "3:00 PM"
  const m12 = t.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);
  if (!m12) return "";
  let h = parseInt(m12[1], 10);
  const min = m12[2];
  const ap = m12[3];
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2,"0")}:${min}`;
};

const buildWaUrl = (e164Phone, text) => {
  const num = e164Phone.replace(/^\+/, "");          // wa.me expects no leading +
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}&ts=${Date.now()}`;
};

const openWhatsApp = (e164Phone, text) => {
  const url = buildWaUrl(e164Phone, text);
  if (window.waWindow && !window.waWindow.closed) {
    try { window.waWindow.close(); } catch {}
  }
  window.waWindow = window.open(url, "_blank", "noopener,noreferrer");
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const AnalyzeMeetingsComponent = () => {
  const [eventOpen, setEventOpen] = useState(false);
const [eventDefaults, setEventDefaults] = useState({}); // { title, date }
  const [inputContacts, setInputContacts] = useState('');
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [recommendedTimes, setRecommendedTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ===== NEW: contacts for autocomplete AND phone lookup =====
  const [allContactNames, setAllContactNames] = useState([]); // for suggestions
  const [nameToPhones, setNameToPhones] = useState(new Map()); // Map<string, string[]>
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestRef = useRef(null);

  // ===== NEW: reply modal state =====
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContactName, setReplyContactName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyPhones, setReplyPhones] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [sending, setSending] = useState(false);

  // ==== SEND MESSAGE CONFIG (adjust if your route/shape differs) ====
  const WHATSAPP_SEND_ENDPOINT = '/api/send'; // expects { phone, msg }

  const parseContacts = () => {
    return inputContacts
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  };

  // ===== Fetch WhatsApp contacts + fallback form contacts (for suggestions) =====
  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const [waRes, formRes] = await Promise.allSettled([
          axios.get('/api/whatsapp-contacts'),
          axios.get('/api/contacts'),
        ]);

        const names = new Set();
        const phoneMap = new Map(); // temp Map<string, Set<string>>

        const addNamePhone = (firstName, lastName, phone) => {
          const name = `${firstName || ''} ${lastName || ''}`.trim();
          if (!name) return;
          names.add(name);
          if (phone) {
            if (!phoneMap.has(name)) phoneMap.set(name, new Set());
            phoneMap.get(name).add(String(phone).trim());
          }
        };

        if (waRes.status === 'fulfilled' && Array.isArray(waRes.value.data)) {
          waRes.value.data.forEach(c => addNamePhone(c.firstName, c.lastName, c.phone));
        }
        if (formRes.status === 'fulfilled' && Array.isArray(formRes.value.data)) {
          formRes.value.data.forEach(c => addNamePhone(c.firstName, c.lastName, c.phone || c.phoneNo));
        }

        setAllContactNames([...names].sort((a, b) => a.localeCompare(b)));

        // convert phoneMap sets to arrays
        const concreteMap = new Map();
        for (const [name, setPhones] of phoneMap.entries()) {
          concreteMap.set(name, [...setPhones]);
        }
        setNameToPhones(concreteMap);
      } catch (e) {
        console.warn('Suggestion/phone sources unavailable:', e);
      }
    };

    fetchAllNames();
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/flagged-messages');
        setFlaggedMessages(response.data.flaggedMessages || []);
        setRecommendedTimes(response.data.recommendedTimes || {});
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to load existing messages');
      }
    };
    loadInitialData();
  }, []);

  const handleAnalyzeMessages = async () => {
    setLoading(true);
    setError(null);
    const contacts = parseContacts();

    if (contacts.length === 0) {
      setError('Please enter at least one contact');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/scrape-whatsapp', {
        contacts: contacts
      });

      setFlaggedMessages(response.data.flaggedMessages || []);
      setRecommendedTimes(response.data.recommendedTimes || {});
      setLastUpdated(new Date());

      const updatedResponse = await axios.get('http://localhost:5000/api/flagged-messages');
      setFlaggedMessages(updatedResponse.data.flaggedMessages || []);
      setRecommendedTimes(updatedResponse.data.recommendedTimes || {});
      setLastUpdated(new Date());

    } catch (err) {
      const errMsg = err?.response?.data?.error || err.message || 'Analysis failed';
      const isJsonError = errMsg.includes("Unexpected token");
      const userFriendlyError = isJsonError ? "Invalid contact name" : errMsg;
      setError(userFriendlyError);
      toast.error(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete('http://localhost:5000/api/flagged-messages', {
        data: { messageId }
      });
      setFlaggedMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (err) {
      setError('Failed to delete message');
      toast.error("Failed to delete message");
    }
  };

  // ===== NEW: open reply modal for a contact name =====
  const openReplyForContact = (contactName, prefillText = '') => {
    const phones = nameToPhones.get(contactName) || [];
    setReplyContactName(contactName);
    setReplyPhones(phones);
    setSelectedPhone(phones[0] || '');
    setReplyText(prefillText);
    setReplyOpen(true);
  };

const sendReply = async () => {
  if (!selectedPhone) {
    toast.error("No phone number saved for this contact.");
    return;
  }
  if (!replyText.trim()) {
    toast.error("Message cannot be empty.");
    return;
  }

  // 1) Normalize number like on ContactPage
  const e164 = normalizePhone(selectedPhone);

  // 2) Open WhatsApp directly (same UX as FinalMessageEdit flow on ContactPage)
  try {
    setSending(true);
    openWhatsApp(e164, replyText.trim());
    toast.success("Opening WhatsApp…");
    setReplyOpen(false);
    setReplyText("");
  } catch (e) {
    console.error(e);
    toast.error("Failed to open WhatsApp.");
  } finally {
    setSending(false);
  }

  // Optional: if you still want to hit your backend /api/send after opening WhatsApp,
  // uncomment below. Otherwise, the browser open is enough.
  /*
  try {
    await axios.post('/api/send', { phone: e164, msg: replyText.trim() });
  } catch (e) {
    console.warn("Backend send failed (continuing):", e?.response?.data || e.message);
  }
  */
};


  const parsedContacts = parseContacts();

  const filteredMessages = parsedContacts.length === 0
    ? flaggedMessages
    : flaggedMessages.filter(msg => parsedContacts.includes(msg.contact));

  const groupMessagesByContact = (messages) => {
    return messages.reduce((acc, msg) => {
      const key = msg.contact ?? "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(msg);
      return acc;
    }, {});
  };

  // ===== Suggestions for current token (from previous step) =====
  const currentToken = useMemo(() => {
    const lastComma = inputContacts.lastIndexOf(',');
    const token = lastComma === -1
      ? inputContacts.trim()
      : inputContacts.slice(lastComma + 1).trim();
    return token;
  }, [inputContacts]);

  const tokenSuggestions = useMemo(() => {
    if (!currentToken) return [];
    const lower = currentToken.toLowerCase();
    const selected = new Set(parsedContacts.map(n => n.toLowerCase()));
    return allContactNames
      .filter(n => !selected.has(n.toLowerCase()) && n.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [currentToken, allContactNames, parsedContacts]);

  const insertSuggestion = (name) => {
    const lastComma = inputContacts.lastIndexOf(',');
    const prefix = lastComma === -1 ? '' : inputContacts.slice(0, lastComma + 1);
    const newValue = `${prefix}${prefix && !prefix.endsWith(' ') ? ' ' : ''}${name}`;
    setInputContacts(newValue);
    setShowSuggest(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        suggestRef.current &&
        !suggestRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="flex justify-center p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-3xl bg-white text-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Interested Clients</h2>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center space-x-2 relative">
            <label htmlFor="contacts" className="text-sm font-medium text-gray-700">
              Contacts to scan:
            </label>

            {/* Input with suggestions */}
            <div className="relative flex-1">
              <input
                id="contacts"
                ref={inputRef}
                type="text"
                value={inputContacts}
                onChange={(e) => {
                  setInputContacts(e.target.value);
                  const val = e.target.value;
                  const lastComma = val.lastIndexOf(',');
                  const token = (lastComma === -1 ? val : val.slice(lastComma + 1)).trim();
                  setShowSuggest(token.length > 0);
                  setHighlightIndex(-1);
                }}
                onFocus={() => setShowSuggest(currentToken.length > 0 && tokenSuggestions.length > 0)}
                onKeyDown={(e) => {
                  if (!showSuggest || tokenSuggestions.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightIndex((i) => (i + 1) % tokenSuggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightIndex((i) => (i - 1 + tokenSuggestions.length) % tokenSuggestions.length);
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    if (highlightIndex >= 0) {
                      e.preventDefault();
                      insertSuggestion(tokenSuggestions[highlightIndex]);
                    } else if (e.key === 'Enter' && tokenSuggestions[0]) {
                      e.preventDefault();
                      insertSuggestion(tokenSuggestions[0]);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggest(false);
                  }
                }}
                className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a name and pick from suggestions"
              />

              {showSuggest && tokenSuggestions.length > 0 && (
                <ul
                  ref={suggestRef}
                  className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  {tokenSuggestions.map((name, idx) => (
                    <li
                      key={name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertSuggestion(name);
                      }}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className={`px-3 py-2 text-sm cursor-pointer ${idx === highlightIndex ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyzeMessages}
              disabled={loading}
              className={`px-5 py-2 rounded-full font-semibold text-white transition flex items-center justify-center text-sm ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze messages'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {filteredMessages.length > 0 ? (
          <ul className="space-y-6">
            {Object.entries(groupMessagesByContact(filteredMessages)).map(([contact, messages]) => {
              const phones = nameToPhones.get(contact) || [];
              const prettyPhone = phones[0] || null;
              return (
                <li key={contact} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">{contact}</h3>
                      {recommendedTimes[contact] && (
                        <p className="text-sm text-green-600 mt-1">
                          🕒 Recommended meeting time: <strong>{recommendedTimes[contact]}</strong>
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {prettyPhone ? `📱 ${prettyPhone}` : '📱 No saved phone'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                    className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                    onClick={() => {
                      const first = contact.split(" ")[0] || contact;

                      // Default event title and date/time
                      const title = `Meeting with ${contact}`;
                      const startTime = toHHMM(recommendedTimes[contact]);

                      let date = new Date();
                      if (recommendedTimes[contact]) {
                        // try to parse recommended time into today’s date
                        const parsed = new Date(`${ymd(new Date())} ${recommendedTimes[contact]}`);
                        if (!isNaN(parsed)) date = parsed;
                      }

                      setEventDefaults({ title, date, startTime });
                      setEventOpen(true);
                    }}
                  >
                    Create Event
                  </button>

                    </div>
                  </div>

                  <ul className="space-y-3 mt-3">
                    {messages.map((message) => (
                      <li
                        key={message.id ?? `${contact}-${message.timestamp}-${message.text.slice(0, 10)}`}
                        className="bg-white border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-gray-800 whitespace-pre-wrap">{message.text}</p>
                          <div className="flex space-x-2">
                            <button
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded"
                              onClick={() => {
                                const first = contact.split(' ')[0] || contact;
                                const rec = recommendedTimes[contact] ? ` Are you free ${recommendedTimes[contact]}?` : "";
                                openReplyForContact(contact, `Hi ${first},${rec} `);
                              }}

                              disabled={!prettyPhone}
                            >
                              Reply
                            </button>
                            <button
                              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.meta
                            ? message.meta.match(/\[(.*?)\]/)?.[1] || 'Unknown Time'
                            : new Date(message.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">No meeting requests found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Enter contacts and click the button to scan for meeting requests.
            </p>
          </div>
        )}
      </div>

      {/* ===== Reply Modal ===== */}
      {replyOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Reply to {replyContactName}</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setReplyOpen(false)}
              >
                ✕
              </button>
            </div>

            {replyPhones.length > 1 && (
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Choose number</label>
                <select
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {replyPhones.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {replyPhones.length === 1 && (
              <p className="text-xs text-gray-600 mb-2">📱 {selectedPhone}</p>
            )}

            {replyPhones.length === 0 && (
              <p className="text-xs text-red-600 mb-2">No phone saved for this contact.</p>
            )}

            <textarea
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Type your message…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setReplyOpen(false)}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm text-white rounded ${sending ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                onClick={sendReply}
                disabled={sending || replyPhones.length === 0}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}


      {eventOpen && (
  <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-5">
      <CreateEventForm
        selectedDate={eventDefaults.date}
        onClose={() => setEventOpen(false)}
        mode="admin"
        defaults={{ eventDefaults }}
      />
    </div>
  </div>
)}
</div>  // main container
);
};
   

export default AnalyzeMeetingsComponent;

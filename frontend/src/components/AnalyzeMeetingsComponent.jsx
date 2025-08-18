import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import CreateEventForm from "./CreateEventForm";
import { Users, Loader2, CalendarDays, Clock, Phone, Trash2, Reply, CalendarPlus } from "lucide-react";

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

  // ===== Fetch WhatsApp contacts for suggestions =====
  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const response = await axios.get('/api/whatsapp-contacts');
        
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

        if (Array.isArray(response.data)) {
          response.data.forEach(c => addNamePhone(c.firstName, c.lastName, c.phone));
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
    const newValue = `${prefix}${prefix && !prefix.endsWith(' ') ? ' ' : ''}${name}, `;
    setInputContacts(newValue);
    setShowSuggest(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
    // Add a small delay before showing suggestions again for the next name
    setTimeout(() => setShowSuggest(true), 100);
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
    <div className="min-h-screen w-full bg-[#F6F7FF] py-8 px-4 md:px-8">
      {/* ===== Header ===== */}
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_10px_30px_-12px_rgba(76,29,149,0.15)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-400/10 to-transparent blur-3xl" />
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Analysis</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-violet-700">
                Interested Clients
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Scan flagged WhatsApp messages, suggest meetings, and reply instantly.
              </p>
            </div>
          </div>
          {lastUpdated && (
            <p className="mt-4 text-xs text-slate-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="mx-auto mt-8 max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_-10px_rgba(76,29,149,0.12)] space-y-6">
          {/* Input + Analyze */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-violet-700">Contacts to scan</label>
            <div className="relative">
              <input
                ref={inputRef}
                value={inputContacts}
                onChange={(e) => {
                  setInputContacts(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                placeholder="Type a name from your WhatsApp contacts..."
                className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
              {showSuggest && tokenSuggestions.length > 0 && (
                <ul
                  ref={suggestRef}
                  className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-2xl border border-violet-100 bg-white shadow-lg"
                >
                  {tokenSuggestions.map((name, idx) => (
                    <li
                      key={name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertSuggestion(name);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer ${
                        idx === highlightIndex
                          ? "bg-violet-600 text-white"
                          : "hover:bg-violet-50"
                      }`}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleAnalyzeMessages}
              disabled={loading}
              className="inline-flex w-max items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus:ring-4 focus:ring-violet-200 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Analyze Messages
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Messages */}
          {filteredMessages.length > 0 ? (
            <ul className="space-y-6">
              {Object.entries(groupMessagesByContact(filteredMessages)).map(
                ([contact, messages]) => {
                  const phones = nameToPhones.get(contact) || [];
                  const prettyPhone = phones[0] || null;

                  return (
                    <li
                      key={contact}
                      className="rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">{contact}</h3>
                          {recommendedTimes[contact] && (
                            <p className="mt-1 text-xs text-slate-500">
                              <Clock className="mr-1 inline h-3.5 w-3.5 text-violet-500" />
                              Recommended: {recommendedTimes[contact]}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-500">
                            <Phone className="mr-1 inline h-3.5 w-3.5 text-violet-500" />
                            {prettyPhone || "No saved phone"}
                          </p>
                        </div>
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          onClick={() => {
                            const title = `Consultation with ${contact}`;
                            // Get the raw time like "3:00 PM" from recommendedTimes
                            const rawTime = recommendedTimes[contact];
                            // Convert it to 24-hour format for the time input (HH:mm)
                            const timeMatch = rawTime?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            let formattedTime = '';
                            if (timeMatch) {
                              let [_, hours, minutes, ampm] = timeMatch;
                              hours = parseInt(hours);
                              if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
                              if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                              formattedTime = `${String(hours).padStart(2, '0')}:${minutes}`;
                            }
                            
                            let date = new Date();
                            if (recommendedTimes[contact]) {
                              const parsed = new Date(
                                `${ymd(new Date())} ${recommendedTimes[contact]}`
                              );
                              if (!isNaN(parsed)) date = parsed;
                            }
                            setEventDefaults({ 
                              title, 
                              date, 
                              startTime: formattedTime,
                              type: 'Consultation'
                            });
                            setEventOpen(true);
                          }}
                        >
                          <CalendarDays className="h-3.5 w-3.5" /> Create Event
                        </button>
                      </div>

                      <ul className="mt-3 space-y-2">
                        {messages.map((message) => (
                          <li
                            key={
                              message.id ??
                              `${contact}-${message.timestamp}-${message.text.slice(
                                0,
                                10
                              )}`
                            }
                            className="rounded-xl border border-violet-100 bg-white p-3 text-sm shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-slate-700 whitespace-pre-wrap">
                                {message.text}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                                  onClick={() => {
                                    const first = contact.split(" ")[0] || contact;
                                    const rec = recommendedTimes[contact]
                                      ? ` Are you free ${recommendedTimes[contact]}?`
                                      : "";
                                    openReplyForContact(contact, `Hi ${first},${rec} `);
                                  }}
                                  disabled={!prettyPhone}
                                >
                                  <Reply className="h-3 w-3 inline" /> Reply
                                </button>
                                <button
                                  className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                                  onClick={() => handleDeleteMessage(message.id)}
                                >
                                  <Trash2 className="h-3 w-3 inline" /> Delete
                                </button>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                              {message.meta
                                ? message.meta.match(/\[(.*?)\]/)?.[1] || "Unknown Time"
                                : new Date(message.timestamp).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
              )}
            </ul>
          ) : (
            <div className="text-center py-10 text-sm text-slate-500">
              No meeting requests found. Enter contacts and analyze.
            </div>
          )}
        </div>
      </div>

      {/* ===== Reply Modal ===== */}
      {replyOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-violet-700">
                Reply to {replyContactName}
              </h4>
              <button
                className="text-slate-500 hover:text-slate-700"
                onClick={() => setReplyOpen(false)}
              >
                ✕
              </button>
            </div>

            {replyPhones.length > 1 && (
              <div className="mb-3">
                <label className="mb-1 block text-sm text-slate-600">
                  Choose number
                </label>
                <select
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm focus:ring-4 focus:ring-violet-100"
                >
                  {replyPhones.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {replyPhones.length === 1 && (
              <p className="mb-2 text-xs text-slate-500">📱 {selectedPhone}</p>
            )}
            {replyPhones.length === 0 && (
              <p className="mb-2 text-xs text-red-600">
                No phone saved for this contact.
              </p>
            )}

            <textarea
              rows={4}
              className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm focus:ring-4 focus:ring-violet-100"
              placeholder="Type your message…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setReplyOpen(false)}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                disabled={sending || replyPhones.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Event Modal ===== */}
      {eventOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <CreateEventForm
              selectedDate={eventDefaults.date}
              onClose={() => setEventOpen(false)}
              mode="admin"
              defaults={eventDefaults}
            />
          </div>
        </div>
      )}
    </div>
  );

};
   

export default AnalyzeMeetingsComponent;

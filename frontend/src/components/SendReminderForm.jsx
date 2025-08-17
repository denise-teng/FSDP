import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  CalendarDays,
  Clock,
  MapPin,
  UserRoundSearch,
  BellRing,
  AlignLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

/* ---------------- helpers ---------------- */
const parseEventDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
};
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = String(timeStr).split(":").map(Number);
  return h * 60 + (m || 0);
};

const SendReminderForm = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- data ---------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/auth/users");
        setUsers(res.data || []);
        setFilteredUsers(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/events");
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const consultationEvents = useMemo(() => {
    if (!events?.length) return [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return events
      .filter((ev) => {
        const d = parseEventDate(ev.date);
        return (
          d &&
          d >= startOfWeek &&
          d < endOfWeek &&
          ev.type?.toLowerCase() === "consultation"
        );
      })
      .sort((a, b) => {
        const da = parseEventDate(a.date);
        const db = parseEventDate(b.date);
        if (!da || !db) return 0;
        if (da.getTime() === db.getTime()) {
          return (
            (timeToMinutes(a.startTime) ?? 9999) -
            (timeToMinutes(b.startTime) ?? 9999)
          );
        }
        return da - db;
      });
  }, [events]);

  /* ---------------- actions ---------------- */
  const handleSend = async () => {
    if (!selectedUser || !message)
      return toast.error("Please select a user and enter a message");
    try {
      await axios.post("/notifications", {
        userId: selectedUser._id,
        text: message,
        trigger: "/secret-calendar",
      });
      toast.success("Reminder sent!");
      setSelectedUser(null);
      setSearch("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full bg-[#F6F7FF] py-8 px-4 md:px-8">
      {/* Header card */}
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_10px_30px_-12px_rgba(76,29,149,0.15)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-400/10 to-transparent blur-3xl" />
          <div className="flex items-start gap-4">
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg">
              <BellRing className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 ring-4 ring-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Reminders</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-violet-700">
                Send Reminder
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Preview this week’s consultations, and send a reminder.
              </p>
            </div>
          </div>

        
        </div>
      </div>

      {/* Body card */}
      <div className="mx-auto mt-8 max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_-10px_rgba(76,29,149,0.12)] space-y-6">
          {/* Events preview */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-violet-700">
              Consultation Events This Week
            </h3>

            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 w-60 animate-pulse rounded-2xl border border-violet-100 bg-violet-50/60"
                  />
                ))}
              </div>
            ) : consultationEvents.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {consultationEvents.map((ev) => {
                  const d = parseEventDate(ev.date);
                  const dateLabel = d
                    ? d.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Unknown date";
                  const timeLabel =
                    ev.startTime && ev.endTime
                      ? `${ev.startTime} – ${ev.endTime}`
                      : ev.startTime || "All day";
                  const isOpen = expandedId === ev._id;

                  return (
                    <div
                      key={ev._id}
                      className="min-w-[240px] max-w-xs flex-shrink-0 rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-4 shadow-sm transition hover:shadow-md"
                    >
                      <h4 className="mb-1 truncate text-sm font-semibold text-slate-800">
                        {ev.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {dateLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          <Clock className="h-3.5 w-3.5" />
                          {timeLabel}
                        </span>
                        {ev.location && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-0.5 text-xs font-medium text-violet-700">
                            <MapPin className="h-3.5 w-3.5" />
                            {ev.location}
                          </span>
                        )}
                      </div>

                      {ev.description && (
                        <p
                          className={`mt-2 text-xs text-slate-600 ${
                            isOpen ? "" : "line-clamp-2"
                          }`}
                        >
                          {ev.description}
                        </p>
                      )}

                      <button
                        onClick={() => setExpandedId(isOpen ? null : ev._id)}
                        className="mt-2 text-[11px] font-medium text-violet-700 hover:underline"
                      >
                        {isOpen ? "Hide details" : "More details"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center text-xs text-slate-500">
                No consultation events this week.
              </div>
            )}
          </div>

          {/* Search + dropdown */}
          <div className="relative">
            <div className="flex items-center rounded-2xl border border-violet-200 bg-white px-3 py-2 shadow-sm focus-within:ring-4 focus-within:ring-violet-100">
              <UserRoundSearch className="mr-2 h-4 w-4 text-violet-600" />
              <input
                type="text"
                placeholder="Search user by name or email…"
                className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedUser(null);
                }}
              />
            </div>

            {search && !selectedUser && (
              <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-violet-100 bg-white shadow-lg">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-violet-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearch(user.name || user.email);
                      }}
                    >
                      <span className="grid h-7 w-7 flex-none place-items-center rounded-xl bg-violet-600/10 text-violet-700">
                        {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
                      </span>
                      <span className="truncate">
                        <span className="font-medium">{user.name || "Unnamed"}</span>{" "}
                        <span className="text-slate-500">— {user.email}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400">No users found</div>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-700">
              <AlignLeft className="h-4 w-4" />
              Message
            </label>
            <textarea
              placeholder="Enter reminder message…"
              className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-violet-100"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setSelectedUser(null);
                setSearch("");
                setMessage("");
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-violet-200"
            >
              <Send className="h-4 w-4" />
              Send Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReminderForm;

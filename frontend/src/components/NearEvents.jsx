// NearEvents.jsx
import { useEffect, useMemo } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEventStore } from "../stores/useEventStore";

// ===== Helpers =====
const parseEventDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [_, yy, mm, dd] = m;
      return new Date(Number(yy), Number(mm) - 1, Number(dd));
    }
    return new Date(value);
  }
  return new Date(value);
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = String(timeStr).split(":").map(Number);
  return h * 60 + (m || 0);
};

// ===== Component =====
const NearEvents = () => {
  const { events, fetchAllEvents } = useEventStore();

  useEffect(() => {
    fetchAllEvents?.();
  }, [fetchAllEvents]);

  // Compute events in next 7 days
  const nearEvents = useMemo(() => {
    if (!events?.length) return [];
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + 7);

    return events
      .filter((ev) => {
        const d = parseEventDate(ev.date);
        return d && d >= today && d <= cutoff && ev.status === "approved";
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Upcoming Events (Next 7 Days)
      </h3>
      {nearEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nearEvents.map((ev) => {
            const typeColors = {
              Broadcast: "bg-indigo-100 text-indigo-700",
              Consultation: "bg-blue-100 text-blue-700",
              Sales: "bg-yellow-100 text-yellow-700",
              Service: "bg-purple-100 text-purple-700",
              "Policy-updates": "bg-red-100 text-red-700",
            };
            const badge = typeColors[ev.type] || "bg-gray-100 text-gray-700";

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

            return (
              <div
                key={ev._id}
                className="flex flex-col justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {ev.name || ev.type}
                    </h4>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${badge}`}
                    >
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />{" "}
                    {dateLabel}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" /> {timeLabel}
                  </p>
                  {ev.location && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />{" "}
                      {ev.location}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      ev.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : ev.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">
          No upcoming events in the next week.
        </p>
      )}
    </div>
  );
};

export default NearEvents;

// ConsultationBookingPage.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import CalendarView from "../components/CalendarView";

// Convert HH:MM to minutes
// Convert HH:MM, HH:MM:SS, and am/pm to minutes
const timeToMinutes = (str) => {
  if (!str) return 0;
  let s = String(str).trim();

  // capture optional trailing am/pm
  const ampmMatch = s.match(/(am|pm)$/i);
  const ampm = ampmMatch ? ampmMatch[1].toLowerCase() : null;

  // strip am/pm
  s = s.replace(/\s?(am|pm)$/i, "");

  const parts = s.split(":").map(Number);
  let h = parts[0] ?? 0;
  let m = parts[1] ?? 0;

  if (ampm) {
    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
  }
  return h * 60 + m;
};
const parseEventDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  // Force into UTC "date only"
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
};



const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

// Format YYYY-MM-DD
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const ConsultationBooking = () => {
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    topic: "",
    preferredDate: "",
    preferredTime: "",
    endTime: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [events, setEvents] = useState([]);

  // ✅ Fetch ALL events
  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("/events/availability");
      console.log("Fetched availability:", res.data); // 👀 debug
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch availability", err);
    }
  };
  fetchEvents();
}, []);

  useEffect(() => {
    if (!formData.preferredDate) return;
    const [yy, mm, dd] = formData.preferredDate.split("-").map(Number);
    const date = new Date(yy, mm - 1, dd);
    setAvailableSlots(generateSlots(date));
  }, [events, formData.preferredDate]);

const generateSlots = (date) => {
  const slots = [];
  const dayStr = ymd(date);

  // Filter only relevant events for that day
  const dayBlocks = (events || []).filter((ev) => {
  const evDate = parseEventDate(ev.date);
  return evDate === dayStr;   // now both are YYYY-MM-DD
});


console.log("🔍 Generating slots for", dayStr);
console.log("All events:", events);
console.log(
  "Day-blocking events:",
  dayBlocks.map(ev => ({
    date: ev.date,
    type: ev.type,
    start: ev.startTime,
    end: ev.endTime
  }))
);


  for (let hour = 9; hour <= 16; hour++) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00`;

    const slotStart = timeToMinutes(start);
    const slotEnd = timeToMinutes(end);

    let isBlocked = false;

    dayBlocks.forEach((ev) => {
      const evStartRaw = ev.startTime ? timeToMinutes(ev.startTime) : 0;
      const evEndRaw = ev.endTime
        ? timeToMinutes(ev.endTime)
        : ev.startTime
        ? evStartRaw
        : 24 * 60;

      const evStart =
        ev.type === "AdminBlock" && !ev.startTime ? 0 : evStartRaw;
      const evEnd =
        ev.type === "AdminBlock" && !ev.endTime
          ? 24 * 60
          : evEndRaw || evStartRaw + 60;

      console.log(
        `Comparing slot ${start}-${end} (${slotStart}-${slotEnd}) with event ${ev.startTime}-${ev.endTime} (${evStart}-${evEnd})`
      );

      if (overlaps(slotStart, slotEnd, evStart, evEnd)) {
        console.log("❌ Overlap detected!");
        isBlocked = true;
      }
    });

    slots.push({ start, end, isBlocked });
  }

  return slots;
};







  // ✅ Handle date select
  const handleDateSelect = (date) => {
    const picked = ymd(date);
    setFormData((prev) => ({
      ...prev,
      preferredDate: picked,
      preferredTime: "",
      endTime: "",
    }));
    setAvailableSlots(generateSlots(date));
  };

  const handleTimeSelect = (start, end, date) => {
    setFormData((prev) => ({
      ...prev,
      preferredDate: date,
      preferredTime: start,
      endTime: end,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      toast.error("Please log in to request a consultation.");
      return;
    }
    if (!formData.topic || !formData.preferredDate || !formData.preferredTime) {
      toast.error("Please select a topic, date, and time.");
      return;
    }

    // 🔒 Block selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    const selectedDate = new Date(formData.preferredDate);

    if (selectedDate < today) {
      toast.error("You cannot book a consultation for a past date.");
      return;
    }

    try {
      await axios.post("/consultations/consultation-request", {
        name: formData.topic,
        description: `Requested consultation on ${formData.topic} with email ${user.email}`,
        date: formData.preferredDate,
        startTime: formData.preferredTime,
        endTime: formData.endTime,
        email: user.email,
        userId: user._id,
      });

      toast.success("Consultation request submitted!");
      setFormData({ topic: "", preferredDate: "", preferredTime: "", endTime: "" });
      setAvailableSlots([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to submit consultation request");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">
          Book a Consultation
        </h1>

        {/* Calendar */}
        <CalendarView mode="user" onDateSelect={handleDateSelect} />

        {/* Selected */}
        {formData.preferredDate && formData.preferredTime && (
          <p className="mt-4 text-gray-700 font-medium">
            Selected: {formData.preferredDate} | {formData.preferredTime} -{" "}
            {formData.endTime}
          </p>
        )}

        {/* Slots */}
{availableSlots.length > 0 && (
  <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">
      Available Slots
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {availableSlots.filter(s => !s.isBlocked).map((slot, index) => (
            <button
  key={index}
  onClick={() =>
    !slot.isBlocked &&
    handleTimeSelect(slot.start, slot.end, formData.preferredDate)
  }
  disabled={slot.isBlocked}
  className={`px-3 py-2 rounded-lg text-sm font-medium transition border border-black ${
  slot.isBlocked
    ? "bg-red-500 text-white cursor-not-allowed"
    : formData.preferredTime === slot.start
    ? "bg-blue-200 text-blue-700"
    : "bg-white text-gray-700 hover:bg-gray-100"
}`}


>
  {slot.start} - {slot.end}
</button>


      ))}
    </div>
  </div>
)}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 text-base mb-1">
              Topic
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="e.g., Tax Tips, Inheritance distribution..."
              className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 px-6 rounded-lg transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;

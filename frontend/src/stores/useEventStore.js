import {create} from"zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useEventStore = create((set) => ({
    events: [],
    eventsByDate: {},
    loading: false,
    setEvents:(events) => set({events}),



    createEvent: async (eventData) =>{
        set({ loading:true});

        try{
            const res = await axios.post("/events", eventData);
            set((prevState) => ({
                events: [...prevState.events, res.data],
                loading: false,
            }));
        } catch (error) {
            toast.error(error.response.data.error);
            set({loading: false});
        }
    },
    fetchAllEvents: async (silent = false) => {
  set({ loading: true });
  try {
    const response = await axios.get("/events");
    set({ events: response.data, loading: false }); // ✅ save events
  } catch (error) {
    set({ error: "Failed to fetch events", loading: false });
    if (!silent) {
      toast.error(error.response?.data?.error || "Failed to fetch events");
    }
  }
},

fetchEventByType: async (type, silent = false) => {
  set({ loading: true });
  try {
    const response = await axios.get(`/events/type/${type}`);
    set({ events: response.data.events, loading: false });
  } catch (error) {
    set({ error: "Failed to fetch events", loading: false });
    if (!silent) {
      toast.error(error.response?.data?.error || "Failed to fetch events");
    }
  }
},

    deleteEvent: async (eventId) => {
        set({ loading:true});
        try{
            await axios.delete(`/events/${eventId}`);
            set((prevEvents) => ({
                events: prevEvents.events.filter((event) => event._id !==eventId),
                loading: false,
            }));} catch(error) {
                set({ loading: false});
                toast.error(error,response.data.error || "Failed to delete event");
            }
        },
    
    toggleNearEvent: async (eventId) => {
        set({loading:true});

        try{
            const response = await axios.patch(`/events/${eventId}`);
            set((prevEvents)=>({
                events: prevEvents.events.map((event) =>
                    event._id ===eventId ? { ...event, isNear: response.data.isNear} : event),
                loading:false,

            }));
        } catch(error){
            set({loading:false});
            toast.error(error.response.data.error || "Failed to update event");
        }
    },

    fetchNearEvents: async () => {
        set({ loading: true });
        try {
            const response = await axios.get("/events/near");
            set({ events: response.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch events", loading: false });
            console.log("Error fetching featured events:", error);
        }
    },

    updateEvent: async (eventId, updatedData) => {
    set({ loading: true });

    try {
        const response = await axios.put(`/events/${eventId}`, updatedData);


        set((prev) => ({
            events: prev.events.map((event) =>
                event._id === eventId ? response.data : event
            ),
            loading: false,
        }));
        toast.success("Event updated successfully!");
    } catch (error) {
        set({ loading: false });
        toast.error(error.response?.data?.error || "Failed to update event");
    }
},

}));

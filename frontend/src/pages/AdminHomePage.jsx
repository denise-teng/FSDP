import React, { useState } from 'react';
import { Mail, Users, BarChart2, LayoutDashboard, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Example of tabs
const tabs = [
  { id: 'contacts', label: 'Contacts', icon: Mail },
  { id: 'quickMessages', label: 'Quick Messages', icon: MessageSquare },
];

const AdminHomePage = () => {
  const [activeTab, setActiveTab] = useState('contacts');

  return (
    <div className="bg-neutral-50 min-h-screen text-black font-sans px-8 pt-24 pb-12">

      {/* Engagement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <motion.div
          className="bg-white text-black rounded-lg p-6 shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-lg font-semibold mb-4">My Engagement Statistics</h2>
          <div className="relative">
            <img src="/dashboard-chart-placeholder.png" alt="Engagement Stats" className="w-full rounded-md" />
            {/* You could replace this with an actual graph here */}
          </div>
        </motion.div>

        <motion.div
          className="bg-white text-black rounded-lg p-6 shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-lg font-semibold mb-4">Today's Summary</h2>
          <ul className="text-sm list-disc list-inside text-gray-700">
            <li>📅 12 July 2025</li>
            <li>Follow-up with Client Tay (10:00 AM)</li>
            <li>Tax Briefing Broadcast (4:00 PM)</li>
          </ul>
          <div className="mt-4">
            <img src="/calendar-widget-placeholder.png" alt="Calendar" className="w-full rounded-md" />
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-24">
        <h2 className="text-xl font-bold text-black mb-6">UPCOMING EVENTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <EventCard
            title="Taxes for IRAS NOA (July)"
            date="24 June 2025"
            time="3:00 PM"
            location="N/A"
            notes="Send soft/hardcopy reminders for IRAS NOA tax filing (if applicable)"
            image="/event1.jpg"
          />
          <EventCard
            title="Meeting with Shannon"
            date="27 June 2025"
            time=""
            location="Kallang Road, 362172"
            notes="Bring documents and past paperwork to my office"
            image="/event2.jpg"
          />
        </div>
      </section>
    </div>
  );
};

// Event Card Component with hover effects
const EventCard = ({ title, date, time, location, notes, image }) => (
  <motion.div
    className="bg-white text-black border rounded-lg shadow-lg p-4 hover:scale-105 transition-all duration-300 ease-in-out"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <img src={image} alt={title} className="w-full h-32 object-cover rounded mb-4" />
    <h3 className="text-md font-semibold">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{date} {time && `• ${time}`}</p>
    <p className="text-sm mt-1 text-gray-700">{location}</p>
    <p className="text-xs mt-2 text-gray-500">{notes}</p>
  </motion.div>
);

export default AdminHomePage;

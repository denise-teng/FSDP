import React, { useState } from 'react';
import { Mail, Users, BarChart2, LayoutDashboard, MessageSquare, 
  ArrowRight, ChevronDown, X, Check, MapPin, Phone, 
  ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle  } from 'lucide-react';
import {  motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import NearEvents from '../components/NearEvents';
import { Link } from 'react-router-dom';
// Example of tabs
const tabs = [
  { id: 'contacts', label: 'Contacts', icon: Mail },
  { id: 'quickMessages', label: 'Quick Messages', icon: MessageSquare },
];

const AdminHomePage = () => {
  const [currentUpdate, setCurrentUpdate] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Sample updates data
  const updates = [
    {
      id: 1,
      title: "New Client Onboarding",
      description: "5 new clients completed onboarding this week",
      date: "Today, 10:30 AM",
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-100"
    },
    {
      id: 2,
      title: "Quarterly Reports",
      description: "Q2 financial reports are now available for review",
      date: "Yesterday, 3:45 PM",
      icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      id: 3,
      title: "System Maintenance",
      description: "Scheduled maintenance this Saturday from 2-4 AM",
      date: "Jul 10, 2025",
      icon: <LayoutDashboard className="h-6 w-6 text-green-600" />,
      color: "bg-green-100"
    }
  ];

  // Auto-rotate updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setCurrentUpdate((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovering]);

  const nextUpdate = () => {
    setCurrentUpdate((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
  };

  const prevUpdate = () => {
    setCurrentUpdate((prev) => (prev === 0 ? updates.length - 1 : prev - 1));
  };

  // Engagement chart data
  const engagementData = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 59 },
    { month: 'Mar', value: 80 },
    { month: 'Apr', value: 81 },
    { month: 'May', value: 56 },
    { month: 'Jun', value: 55 },
    { month: 'Jul', value: 40 }
  ];

  const maxValue = Math.max(...engagementData.map(item => item.value));

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

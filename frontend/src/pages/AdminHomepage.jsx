import React, { useState } from 'react';
import {
    Mail, Users, BarChart2, LayoutDashboard, MessageSquare,
    ArrowRight, ChevronDown, X, Check, MapPin, Phone,
    ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

        <div className="bg-gray-50 min-h-screen text-gray-900 font-sans px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            < Navbar />
            {/* Welcome Header with animated gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto mb-8"
            >
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%'
                        }}
                    />
                    <div className="relative z-10 p-6 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Yip Cheu Fong</h1>
                        <p className="text-blue-100 opacity-90">Here's what's happening with your business today</p>
                    </div>
                </div>
            </motion.div>

            {/* Updates Carousel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-7xl mx-auto mb-12 relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="p-6 flex items-center justify-between border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
                            Recent Updates
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={prevUpdate}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition hover:scale-105"
                                aria-label="Previous update"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-700" />
                            </button>
                            <button
                                onClick={nextUpdate}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition hover:scale-105"
                                aria-label="Next update"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentUpdate}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="px-6 pb-6 pt-4"
                        >
                            <div className="flex items-start">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${updates[currentUpdate].color} flex items-center justify-center mr-4`}>
                                {updates[currentUpdate].icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{updates[currentUpdate].title}</h3>
                                <p className="text-gray-600 mt-1">{updates[currentUpdate].description}</p>
                                <p className="text-sm text-gray-500 mt-2 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {updates[currentUpdate].date}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicators */}
                <div className="px-6 pb-4 flex justify-center space-x-2">
                    {updates.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentUpdate(index)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${currentUpdate === index ? 'bg-indigo-600 w-6' : 'bg-gray-300'}`}
                aria-label={`Go to update ${index + 1}`}
            />
            ))}
                </div>
        </div>
      </motion.div >

    {/* Dashboard Metrics */ }
    < div className = "max-w-7xl mx-auto" >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Engagement Chart */}
        <motion.div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Engagement Statistics</h2>
                    <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        <span className="h-2 w-2 bg-indigo-600 rounded-full mr-2"></span>
                        Last 7 Months
                    </div>
                </div>
                <div className="relative h-64">
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="flex items-end h-48 space-x-2 px-4">
                            {engagementData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.value / maxValue) * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg relative group"
                                >
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="absolute -top-6 left-0 right-0 text-center text-xs text-gray-600 font-medium"
                                    >
                                        {item.value}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600"
                                    >
                                        {item.month}
                                    </motion.div>
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.value} engagements
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

    {/* Today's Summary */ }
    < motion.div
className = "bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
initial = {{ opacity: 0, y: 20 }}
animate = {{ opacity: 1, y: 0 }}
transition = {{ duration: 0.5, delay: 0.1 }}
whileHover = {{ y: -5 }}
          >
    <div className="p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Summary</h2>
            <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>12 July 2025</span>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Follow-up with Client Tay</p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">10:00 AM</span>
                        <span className="mx-2">•</span>
                        <span>15 mins remaining</span>
                    </p>
                </div>
            </div>

            <div className="flex items-start p-3 bg-indigo-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Tax Briefing Broadcast</p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">4:00 PM</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2
                    }}
                    className="z-10"
                >
                    <LayoutDashboard className="h-12 w-12 text-blue-400" />
                </motion.div>
                <p className="ml-4 text-blue-600 z-10">Calendar integration coming soon</p>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full filter blur-xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-200 rounded-full filter blur-xl"></div>
                </div>
            </div>
        </div>
    </div>
          </motion.div >
        </div >

    {/* Upcoming Events Section */ }
    < section className = "mb-16" >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">UPCOMING EVENTS</h2>
           <Link 
  to="/secret-calendar" 
  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
>
  View all events
  <ArrowRight className="h-4 w-4 ml-1" />
</Link>
          </div>
          
          <NearEvents />
        </section >
      </div >


    </div >
  );
};

const EventCard = ({ title, date, time, location, notes, status }) => {
    const statusColors = {
        urgent: 'bg-red-100 text-red-800',
        upcoming: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800'
    };

return (
    <>
        <motion.div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent z-10"></div>
                <div className="absolute top-4 right-4 z-20">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
                    </span>
                </div>
                <Users className="h-12 w-12 text-indigo-400 z-10" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-200 rounded-full filter blur-xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 rounded-full filter blur-xl"></div>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{date} {time && <>• {time}</>}</span>
                </div>
                {location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{location}</span>
                    </div>
                )}
                <p className="text-sm text-gray-600 mb-4">{notes}</p>
                <div className="flex justify-between items-center">
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        More details
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                    <div className="flex space-x-2">
                        <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <Phone className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <Mail className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    </>
);
};

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setTimeout(() => {
            setSubscribed(false);
            setEmail('');
        }, 3000);
    };

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-950 text-gray-200 pt-16 pb-8 px-6"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Financial Freedom</h3>
                        <p className="text-gray-400 text-sm">
                            Empowering your financial future with personalized strategies and expert guidance.
                        </p>
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>123 Financial Ave, Singapore 123456</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>+65 88058250</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>yipchuefong@gmail.com</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Quick Links</h3>
                        <ul className="space-y-2">
                            {["Dashboard", "Contacts", "Messages", "Calendar", "Reports"].map((item) => (
                                <motion.li
                                    key={item}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition flex items-center"
                                    >
                                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                                        {item}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-4"
                    >
                        <h3 className="text-white text-xl font-semibold pb-2 border-b border-indigo-800 inline-block">Resources</h3>
                        <ul className="space-y-2">
                            {[
                                "Client Documents",
                                "Tax Forms",
                                "Policy Templates",
                                "Training Materials",
                                "Compliance Guides"
                            ].map((resource) => (
                                <motion.li
                                    key={resource}
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition flex items-center"
                                    >
                                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                                        {resource}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="border-t border-indigo-800 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
                >
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                        </svg>
                        <p className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Financial Freedom. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Sitemap'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-xs text-gray-500 hover:text-white transition hover:underline"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-xs text-gray-600">
                            Registered Financial Advisor • MAS License No: ABC123456
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default AdminHomePage;
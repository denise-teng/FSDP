import React, { useState } from 'react';
import { motion } from 'framer-motion'; // For animation effects
import { Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import ContactPage from './Contactpage';
import WhatsAppContacts from './WhatsappContacts';
import PotentialClients from './PotentialClients';
import ContactsHistory from './contacthistory'; // Import the new ContactsHistory component

export default function AdminContactPage() {
  const [activeSubTab, setActiveSubTab] = useState('form');

  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'form':
        return <ContactPage />;
      case 'whatsapp':
        return <WhatsAppContacts />;
      case 'potential':
        return <PotentialClients />;
      case 'history': // Case for the new "Contacts History" tab
        return <ContactsHistory />;
      default:
        return <ContactPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
            
            <div className="relative flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Contact Management
                  </span>
                </h2>
                <p className="text-gray-600 text-lg">Manage all your contacts, leads, and communications</p>
              </div>
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Sub Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
            <div className="flex justify-center gap-3 flex-wrap">
              <motion.button
                onClick={() => setActiveSubTab('form')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out ${
                  activeSubTab === 'form'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  📝 Form Contacts
                </span>
              </motion.button>
              <motion.button
                onClick={() => setActiveSubTab('whatsapp')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out ${
                  activeSubTab === 'whatsapp'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  💬 WhatsApp Contacts
                </span>
              </motion.button>
              <motion.button
                onClick={() => setActiveSubTab('potential')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out ${
                  activeSubTab === 'potential'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  ⭐ Potential Clients
                </span>
              </motion.button>
              <motion.button
                onClick={() => setActiveSubTab('history')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ease-in-out ${
                  activeSubTab === 'history'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  📚 Contacts History
                </span>
              </motion.button>
            </div>
          </div>

          {/* SubTab Content with Animation */}
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSubTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

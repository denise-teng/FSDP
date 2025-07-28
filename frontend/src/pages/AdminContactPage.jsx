import React, { useState } from 'react';
import { motion } from 'framer-motion'; // For animation effects
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
    <div>
      {/* Tab buttons with hover and active state effects */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.button
          onClick={() => setActiveSubTab('form')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'form'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }} // Hover effect to scale up the button
        >
          Form Contacts
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'whatsapp'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }} // Hover effect to scale up the button
        >
          WhatsApp Contacts
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('potential')}
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'potential'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }} // Hover effect to scale up the button
        >
          Potential Clients
        </motion.button>
        <motion.button
          onClick={() => setActiveSubTab('history')} // Add a button for "Contacts History"
          className={`px-4 py-2 rounded transition-all duration-300 ease-in-out ${
            activeSubTab === 'history'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.1 }} // Hover effect to scale up the button
        >
          Contacts History
        </motion.button>
      </div>

      {/* SubTab Content with Sliding/Opening Effect */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 50 }} // Start from below and fade in
        animate={{ opacity: 1, y: 0 }} // Fade in and slide to normal position
        exit={{ opacity: 0, y: 50 }} // Slide out when leaving
        transition={{ duration: 0.5 }} // Smooth transition duration
      >
        {renderSubTab()}
      </motion.div>
    </div>
  );
}

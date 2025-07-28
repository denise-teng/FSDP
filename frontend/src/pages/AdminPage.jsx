import React, { useState, useEffect } from 'react';
import { RadioTower, BarChart, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import BroadcastPage from './BroadcastPage'; // Adjust path if it's a page
import AnalyticsTab from '../components/AnalyticsTab';
import ContentGenerationPage from './ContentGenerationPage';



const tabs = [
  { id: "broadcast", label: "Broadcast", icon: RadioTower },
  { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "content", label: "Content Generation", icon: Newspaper },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('broadcast');

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="flex justify-center mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 my-1 rounded-md transition-colors duration-200 ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "broadcast" && <BroadcastPage />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "content" && <ContentGenerationPage />}
      </div>
    </div>
  );
};

export default AdminPage;

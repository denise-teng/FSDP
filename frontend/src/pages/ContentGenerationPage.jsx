import { useState } from 'react';
import { motion } from 'framer-motion';
import GenerateMessagePage from './GenerateMessagePage';
import EditNewsletterPage from './EditNewsletterPage';
import UploadNewsletter from './UploadNewsletter';
import DraftPage from './DraftsPage';
import EditHomeSlotPage from './EditHomeSlotPage';
import EnhanceNewsletterPage from "../components/EnhanceNewsletterPage";
import ViewSubscriberPage from './ViewSubscriberPage';

const ContentGenerationPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('generate');

  const renderSubTab = () => {
    switch (activeSubTab) {
      case 'generate':
        return <GenerateMessagePage />;
      case 'uploadNewsletter':
        return <UploadNewsletter />;
      case 'enhanceNewsletter':
        return <EnhanceNewsletterPage />;
      case 'drafts':
        return <DraftPage />;
      case 'editHomeSlot':
        return <EditHomeSlotPage />;
      case 'viewSubscribers':
        return <ViewSubscriberPage />;
      default:
        return <GenerateMessagePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                ✨ Content Generation Hub
              </h2>
              <p className="text-gray-600 text-lg">Create, manage, and enhance newsletters effortlessly</p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Button Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg p-6 mb-10 flex flex-wrap justify-center gap-4">
          {[
            { key: 'generate', label: 'Generate' },
            { key: 'uploadNewsletter', label: 'Upload Newsletter' },
            { key: 'enhanceNewsletter', label: 'Enhance Newsletter' },
            { key: 'drafts', label: 'Drafts' },
            { key: 'editHomeSlot', label: 'Edit HomeSlot' },
            { key: 'viewSubscribers', label: 'View Subscribers' }
          ].map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              whileHover={{ scale: 1.05 }}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${activeSubTab === tab.key
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100'
                }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
        {['generate', 'uploadNewsletter', 'enhanceNewsletter', 'drafts', 'editHomeSlot'].includes(activeSubTab) ? (
          renderSubTab()
        ) : (
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-6">
            {renderSubTab()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerationPage;


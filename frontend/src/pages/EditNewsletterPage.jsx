import { useParams, useLocation } from "react-router-dom";
import UploadForm from "../components/UploadForm";
import { motion } from 'framer-motion';
import { useState } from 'react';

const EditNewsletterPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isDraft = location.pathname.includes('/edit-draft/');
  const [activeSubTab, setActiveSubTab] = useState('editNewsletter');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Content Generation Header */}
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
            { key: 'editNewsletter', label: 'Edit Newsletter' }
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

        {/* Edit Newsletter Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          {/* Header Content */}
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isDraft ? "✏️ Edit Draft" : "📝 Edit Newsletter"}
              </h2>
              <p className="text-gray-600 text-lg">
                {isDraft
                  ? "Modify your draft content and attachments"
                  : "Update your newsletter content and attachments"}
              </p>
            </div>

            {/* Icon */}
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs font-bold text-white">Edit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div>
          <UploadForm editMode={true} newsletterId={id} isDraft={isDraft} />
        </div>
      </div>
    </div>
  );
};

export default EditNewsletterPage;
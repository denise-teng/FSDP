import { useState } from 'react';
import GenerateMessageModal from '../components/GenerateMessageModal'; // Import the component

const GenerateMessagePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h2 className="text-2xl font-semibold mb-4 text-emerald-400 text-center">Generate Message</h2>

      {/* Use the GenerateMessageModal directly as a component */}
      <GenerateMessageModal onClose={() => {}} />
    </div>
  );
};

export default GenerateMessagePage;

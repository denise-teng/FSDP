// frontend/pages/ContentGenerationPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import GenerateMessageModal from "../components/GenerateMessageModal"; 
import UpdateHomepageModal from "../components/UpdateHomepagemodal"; 


const cards = [
  { label: "🧠 Generate", action: "openModal", disabled: false },
  { label: "📝 Edit Newsletter", path: "#", disabled: true },
  { label: "📄 Drafts", path: "/drafts", disabled: false },
  { label: "⬆️ Upload Newsletter", path: "/upload-newsletter", disabled: false },
  { label: "🏠 Edit HomeSlot", action: "openModal", disabled: false }, // Remove the link and use modal instead
];

const ContentGenerationPage = () => {
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-emerald-400">Content Generation</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {cards.map((card, index) => {
          const isGenerate = card.action === "openModal";

          return isGenerate ? (
            <button
              key={index}
              onClick={() => setShowModal(true)} // Trigger modal on button click
              className="p-8 rounded-lg shadow-md flex flex-col items-center justify-center text-center text-xl font-semibold bg-emerald-700 hover:bg-emerald-600 transition-all duration-300"
            >
              {card.label}
            </button>
          ) : (
            <Link
              key={index}
              to={card.disabled ? "#" : card.path}
              className={`p-8 rounded-lg shadow-md flex flex-col items-center justify-center text-center text-xl font-semibold transition-all duration-300 ${
                card.disabled
                  ? "bg-gray-600 opacity-50 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-600"
              }`}
            >
              {card.label}
            </Link>
          );
        })}
      </div>

      {/* Modal for updating homepage slots */}
      {showModal && (
        <UpdateHomepageModal
          isOpen={showModal}
          onClose={() => setShowModal(false)} // Close modal when clicked outside or on close
          newNewsletter={null}  // Pass any data needed for the modal
          isLoading={false}  // Set to true if you're handling loading state
        />
      )}
    </div>
  );
};

export default ContentGenerationPage;

// frontend/pages/EditHomeSlotPage.jsx
import { useState } from "react";

const EditHomeSlotPage = () => {
  // State to manage the content of each slot
  const [slot1Content, setSlot1Content] = useState("");
  const [slot2Content, setSlot2Content] = useState("");
  const [slot3Content, setSlot3Content] = useState("");

  // Handle content change for each slot
  const handleChange = (e, setSlot) => {
    setSlot(e.target.value);
  };

  // Save the changes (this could be an API call or state update)
  const handleSave = () => {
    console.log("Saved content for Slot 1:", slot1Content);
    console.log("Saved content for Slot 2:", slot2Content);
    console.log("Saved content for Slot 3:", slot3Content);
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit HomeSlot</h1>
        <p className="text-gray-300 mt-2">
          Edit the content for the HomeSlot. You can update the text in each box and save it.
        </p>
      </div>

      {/* Container for the three editable boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Slot 1 */}
        <textarea
          value={slot1Content}
          onChange={(e) => handleChange(e, setSlot1Content)}
          placeholder="Enter content for Slot 1..."
          className="w-full p-4 rounded-lg text-black mb-4 h-32"
        />

        {/* Slot 2 */}
        <textarea
          value={slot2Content}
          onChange={(e) => handleChange(e, setSlot2Content)}
          placeholder="Enter content for Slot 2..."
          className="w-full p-4 rounded-lg text-black mb-4 h-32"
        />

        {/* Slot 3 */}
        <textarea
          value={slot3Content}
          onChange={(e) => handleChange(e, setSlot3Content)}
          placeholder="Enter content for Slot 3..."
          className="w-full p-4 rounded-lg text-black mb-4 h-32"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditHomeSlotPage;

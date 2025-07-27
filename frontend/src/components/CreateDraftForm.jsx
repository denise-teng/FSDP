import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";

const categories = [
  "Financial Planning",
  "Insurance",
  "Estate Planning",
  "Tax Relief"
];

const CreateDraftForm = () => {
  const [newDraft, setNewDraft] = useState({
    title: "",
    content: "",
    category: ""
  });

  const { createDraft, loading } = useDraftStore();

  const handleChange = (e) => {
    setNewDraft({ ...newDraft, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDraft(newDraft);
      setNewDraft({ title: "", content: "", category: "" });
    } catch (error) {
      console.error("Error creating draft");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Draft
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={newDraft.title}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-gray-300 block mb-1">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="text-gray-300 block mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
            required
          >
            <option value="">Select a category</option>
            <option value="Financial Planning">Financial Planning</option>
            <option value="Insurance">Insurance</option>
            <option value="Estate Planning">Estate Planning</option>
            <option value="Tax Relief">Tax Relief</option>
          </select>
        </div>



        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Draft
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateDraftForm;

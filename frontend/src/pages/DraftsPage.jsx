// pages/DraftPage.jsx
import DraftList from "../components/DraftList";

const DraftPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Page-level header or UI */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Draft Management</h1>
        <p className="text-gray-300 mt-2">
          Below is a list of your saved drafts. You can preview, edit, or delete them.
        </p>
      </div>

      {/* Reusable DraftList component */}
      <DraftList />
    </div>
  );
};

export default DraftPage;

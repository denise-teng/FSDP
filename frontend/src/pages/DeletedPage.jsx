// pages/DeletedPage.jsx
import DeletedList from "../components/DeletedList";

const DeletedPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Recently Deleted</h1>
        <p className="text-gray-300 mt-2">
          View, restore, or permanently delete your deleted drafts.
        </p>
      </div>

      <DeletedList />
    </div>
  );
};

export default DeletedPage;
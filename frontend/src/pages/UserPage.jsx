import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import UserTable from '../components/UserTable';

const UserPage = () => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f3f5ff] flex items-center justify-center px-6">
        <div className="text-gray-500 text-lg font-medium">
          You must be logged in to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3f5ff] min-h-screen p-6">
      {user.role === 'admin' ? (
        <UserTable />
      ) : (
        <div className="max-w-3xl mx-auto mt-20 bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">
            🚫 You do not have permission to view this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserPage;

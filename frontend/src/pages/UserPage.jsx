import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import UserTable from '../components/UserTable';

const UserPage = () => {
  const { user } = useUserStore();

  if (!user) {
    return <div className="p-6 text-gray-300">You must be logged in to view this page.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#0f172a] min-h-screen">
      {user.role === 'admin' ? (
        <>
         
          <UserTable />
        </>
      ) : (
        <p className="text-gray-400">You do not have permission to view this page.</p>
      )}
    </div>
  );
};

export default UserPage;

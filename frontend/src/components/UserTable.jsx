import React, { useEffect } from 'react';
import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

const UserTable = () => {
  const { users, getUsers, loading } = useUserStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleToggleRole = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/toggle-role`);
      getUsers();
    } catch (error) {
      console.error('Failed to toggle user role:', error);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-emerald-400">All Users</h2>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1e293b] border border-gray-700 rounded-md shadow-md">
            <thead className="bg-[#334155] text-white">
              <tr>
                <th className="py-3 px-4 border border-gray-700">Name</th>
                <th className="py-3 px-4 border border-gray-700">Email</th>
                <th className="py-3 px-4 border border-gray-700">Role</th>
                <th className="py-3 px-4 border border-gray-700">Toggle</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-[#1f2937] transition">
                    <td className="py-2 px-4 border border-gray-700">{user.name}</td>
                    <td className="py-2 px-4 border border-gray-700">{user.email}</td>
                    <td className="py-2 px-4 border border-gray-700 capitalize">{user.role}</td>
                    <td className="py-2 px-4 border border-gray-700 text-center">
                      <button
                        onClick={() => handleToggleRole(user._id)}
                        className={`px-3 py-1 rounded text-white transition font-medium ${
                          user.role === 'admin'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTable;

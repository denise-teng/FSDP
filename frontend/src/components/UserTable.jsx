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
    <div className="bg-[#f3f5ff] min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">All Users</h2>

        {loading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="py-3 px-5 text-left border-b border-gray-200">Name</th>
                  <th className="py-3 px-5 text-left border-b border-gray-200">Email</th>
                  <th className="py-3 px-5 text-left border-b border-gray-200">Role</th>
                  <th className="py-3 px-5 text-center border-b border-gray-200">Toggle</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-blue-50 transition">
                      <td className="py-3 px-5 border-b border-gray-100">{user.name}</td>
                      <td className="py-3 px-5 border-b border-gray-100">{user.email}</td>
                      <td className="py-3 px-5 border-b border-gray-100 capitalize">{user.role}</td>
                      <td className="py-3 px-5 border-b border-gray-100 text-center">
                        <button
                          onClick={() => handleToggleRole(user._id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm ${
                            user.role === 'admin'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-5 text-center text-gray-500 italic">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;

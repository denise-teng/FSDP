import React, { useEffect } from "react";
import axios from "axios";
import { useUserStore } from "../stores/useUserStore";
import { Users, Loader2 } from "lucide-react";

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
      console.error("Failed to toggle user role:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F7FF] py-8 px-4 md:px-8 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* ===== Header card ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_10px_30px_-12px_rgba(76,29,149,0.15)] mb-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-400/10 to-transparent blur-3xl" />
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Admin Panel</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-violet-700">
                All Users
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage roles and permissions for all accounts.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_28px_-10px_rgba(76,29,149,0.12)]">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-violet-100 rounded-2xl overflow-hidden shadow-sm">
                <thead className="bg-violet-50 text-violet-700">
                  <tr>
                    <th className="py-3 px-5 text-left font-semibold border-b border-violet-100">
                      Name
                    </th>
                    <th className="py-3 px-5 text-left font-semibold border-b border-violet-100">
                      Email
                    </th>
                    <th className="py-3 px-5 text-left font-semibold border-b border-violet-100">
                      Role
                    </th>
                    <th className="py-3 px-5 text-center font-semibold border-b border-violet-100">
                      Toggle
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-violet-50/60 transition"
                      >
                        <td className="py-3 px-5 border-b border-violet-50">
                          {user.name}
                        </td>
                        <td className="py-3 px-5 border-b border-violet-50">
                          {user.email}
                        </td>
                        <td className="py-3 px-5 border-b border-violet-50 capitalize">
                          {user.role}
                        </td>
                        <td className="py-3 px-5 border-b border-violet-50 text-center">
                          <button
                            onClick={() => handleToggleRole(user._id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition ${
                              user.role === "admin"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            }`}
                          >
                            Toggle Role
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 px-5 text-center text-slate-500 italic"
                      >
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
    </div>
  );
};

export default UserTable;

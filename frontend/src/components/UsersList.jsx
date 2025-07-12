import React, { useEffect } from "react";
import { useUserStore } from "../stores/useUserStore";


const UsersList = () => {
  const { users, loading, getUsers } = useUserStore();

  useEffect(() => {
    // Fetch users when component mounts
    getUsers();
  }, [getUsers]);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Check if users data is an array and not undefined
  if (!Array.isArray(users)) {
    return <p>No users found or error in fetching users.</p>;
  }

  return (
    <div>
      <h1>Users List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;

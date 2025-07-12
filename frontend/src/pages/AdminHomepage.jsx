import React from 'react';
import NearEvents from '../components/NearEvents';
import UsersList from '../components/UsersList'; // Import the UsersList component
import { useUserStore } from '../stores/useUserStore';

const AdminHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
        <p className="text-center text-sm text-gray-600">Welcome back, admin.</p>
      </header>

      <section className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Display NearEvents component */}
        <NearEvents />

     
      </section>
    </div>
  );
};

export default AdminHomePage;

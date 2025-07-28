import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Bell,
  Calendar,
  User,
  Home,
  Users,
  BookOpen,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';
import Notifications from './Notifications';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useUserStore();
  const { cart } = useCartStore();
  const isAdmin = user?.role === 'admin';
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-40 transition-all duration-300 border-b border-indigo-200">

      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to={user ? (isAdmin ? "/admin-home" : "/user-home") : "/"}
            className="text-2xl font-bold text-indigo-600 items-center space-x-2 flex"
          >
            YCF
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={user ? (isAdmin ? "/admin-home" : "/user-home") : "/"}
              className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
            >
              <Home className="mr-1" size={20} />
              <span className="hidden sm:inline">
                {user ? (isAdmin ? "Admin Home" : "My Home") : "Home"}
              </span>
            </Link>

            {user && !isAdmin && (
              <Link
                to="/booking"
                className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
              >
                <BookOpen className="mr-1" size={20} />
                <span className="hidden sm:inline">Book Consultation</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/secret-calendar"
                className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
              >
                <Calendar className="mr-1" size={20} />
                <span className="hidden sm:inline">Manage Calendar</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/user-home"
                className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
              >
                <User className="mr-1" size={20} />
                <span className="hidden sm:inline">User View</span>
              </Link>
            )}

            {!isAdmin && (
              <Link
                to="/contact"
                className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out"
              >
                Contact Us
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/secret-dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
                >
                  <Lock className="mr-1" size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  to="/admin-contacts"
                  className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
                >
                  <Mail className="mr-1" size={20} />
                  <span className="hidden sm:inline">Contacts</span>
                </Link>

                <Link
                  to="/quick-messages"
                  className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
                >
                  <MessageSquare className="mr-1" size={20} />
                  <span className="hidden sm:inline">Quick Messages</span>
                </Link>

                <Link
                  to="/users"
                  className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center"
                >
                  <Users className="mr-1" size={20} />
                  <span className="hidden sm:inline">Users</span>
                </Link>
              </>
            )}

            {user && (
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="text-gray-700 hover:text-indigo-600 transition duration-300 ease-in-out flex items-center p-2"
                >
                  <Bell size={20} />
                </button>
                {showNotifications && (
                  <div className="absolute top-full mt-2 right-0 w-80 z-50">
                    <Notifications onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>
            )}

            {user ? (
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

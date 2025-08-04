import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Bell,
  Calendar,
  Home,
  Users,
  BookOpen,
  MessageSquare,
  Mail,
  RadioTower,
  User,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';
import Notifications from './Notifications';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useUserStore();
  const { cart } = useCartStore();
  const isAdmin = user?.role === 'admin';
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-40 transition-all duration-300 border-b border-indigo-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              to={user ? (isAdmin ? "/admin-home" : "/user-home") : "/"}
              className="text-2xl font-bold text-indigo-600 items-center space-x-2 flex"
            >
              YCF
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-wrap items-center gap-4">
            <Link
              to={user ? (isAdmin ? "/admin-home" : "/user-home") : "/"}
              className={`flex items-center transition duration-300 ease-in-out ${
                isActive(user ? (isAdmin ? "/admin-home" : "/user-home") : "/")
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <Home className="mr-1" size={20} />
              <span className="hidden sm:inline">
                {user ? (isAdmin ? "Admin Home" : "My Home") : "Home"}
              </span>
            </Link>

            {user && !isAdmin && (
              <Link
                to="/booking"
                className={`flex items-center transition duration-300 ease-in-out ${
                  isActive("/booking")
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <BookOpen className="mr-1" size={20} />
                <span className="hidden sm:inline">Book Consultation</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/secret-calendar"
                className={`flex items-center transition duration-300 ease-in-out ${
                  isActive("/secret-calendar")
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <Calendar className="mr-1" size={20} />
                <span className="hidden sm:inline">Manage Calendar</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/content-generation"
                className={`flex items-center transition duration-300 ease-in-out ${
                  isActive("/content-generation")
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <Bot className="mr-1" size={20} />
                <span className="hidden sm:inline">Content Generation</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/user-home"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/user-home")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <User className="mr-1" size={20} />
                  <span className="hidden sm:inline">User View</span>
                </Link>
                <Link
                  to="/broadcast"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/broadcast")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <RadioTower className="mr-1" size={20} />
                  <span className="hidden sm:inline">Broadcast</span>
                </Link>
              </>
            )}

            {!isAdmin && (
              <Link
                to="/contact"
                className={`transition duration-300 ease-in-out ${
                  isActive("/contact")
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Contact Us
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/secret-dashboard"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/secret-dashboard")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <Lock className="mr-1" size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  to="/admin-contacts"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/admin-contacts")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <Mail className="mr-1" size={20} />
                  <span className="hidden sm:inline">Contacts</span>
                </Link>

                <Link
                  to="/quick-messages"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/quick-messages")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <MessageSquare className="mr-1" size={20} />
                  <span className="hidden sm:inline">Quick Messages</span>
                </Link>

                <Link
                  to="/users"
                  className={`flex items-center transition duration-300 ease-in-out ${
                    isActive("/users")
                      ? 'text-purple-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
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

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="mobile-menu-container md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50 border-t border-gray-200">
              <nav className="flex flex-col p-4 space-y-4">
                <Link
                  to={user ? (isAdmin ? "/admin-home" : "/user-home") : "/"}
                  className={`flex items-center p-2 rounded-md ${
                    isActive(user ? (isAdmin ? "/admin-home" : "/user-home") : "/")
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="mr-2" size={20} />
                  {user ? (isAdmin ? "Admin Home" : "My Home") : "Home"}
                </Link>

                {user && !isAdmin && (
                  <Link
                    to="/booking"
                    className={`flex items-center p-2 rounded-md ${
                      isActive("/booking")
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="mr-2" size={20} />
                    Book Consultation
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/secret-calendar"
                    className={`flex items-center p-2 rounded-md ${
                      isActive("/secret-calendar")
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="mr-2" size={20} />
                    Manage Calendar
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/content-generation"
                    className={`flex items-center p-2 rounded-md ${
                      isActive("/content-generation")
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bot className="mr-2" size={20} />
                    Content Generation
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/user-home"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/user-home")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="mr-2" size={20} />
                      User View
                    </Link>
                    <Link
                      to="/broadcast"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/broadcast")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <RadioTower className="mr-2" size={20} />
                      Broadcast
                    </Link>
                  </>
                )}

                {!isAdmin && (
                  <Link
                    to="/contact"
                    className={`p-2 rounded-md ${
                      isActive("/contact")
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Contact Us
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/secret-dashboard"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/secret-dashboard")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Lock className="mr-2" size={18} />
                      Dashboard
                    </Link>

                    <Link
                      to="/admin-contacts"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/admin-contacts")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Mail className="mr-2" size={20} />
                      Contacts
                    </Link>

                    <Link
                      to="/quick-messages"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/quick-messages")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="mr-2" size={20} />
                      Quick Messages
                    </Link>

                    <Link
                      to="/users"
                      className={`flex items-center p-2 rounded-md ${
                        isActive("/users")
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="mr-2" size={20} />
                      Users
                    </Link>
                  </>
                )}

                {user && (
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <Bell className="mr-2" size={20} />
                    Notifications
                  </button>
                )}

                {user ? (
                  <button
                    onClick={logout}
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
                  >
                    <LogOut className="mr-2" size={18} />
                    Log Out
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/signup"
                      className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
                    >
                      <UserPlus className="mr-2" size={18} />
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
                    >
                      <LogIn className="mr-2" size={18} />
                      Login
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
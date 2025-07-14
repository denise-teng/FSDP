
import { UserPlus, LogIn, LogOut, Bell, Calendar, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import Notifications from './Notifications';
import { useState } from 'react';


const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === 'admin';
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex flex-wrap justify-between items-center'>
          <Link to='/' className='text-2xl font-bold text-emerald-600 items-center space-x-2 flex'>
            YCF
          </Link>

          <nav className='flex flex-wrap items-center gap-4'>
            <Link to='/' className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
              Home
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/user-home"
                  className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center"
                >
                  Go to User Homepage
                </Link>
                <Link
                  className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
                  to={"/secret-calendar"}
                >
                  <Calendar className='inline-block mr-1' size={18} />
                  <span className='hidden sm:inline'>Calendar</span>
                </Link>
              </>
            )}

            {user && (
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center p-2"
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


          {/* ✅ Brand name: YCF */}
          <Link to='/' className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
            YCF
          </Link>

          <nav className='flex flex-wrap items-center gap-4'>
            {/* ✅ Dynamic Home link based on role */}
            <Link
              to={isAdmin ? '/admin-home' : '/'}
              className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
            >
              Home
            </Link>

            {isAdmin ? (
              <Link
                to='/secret-dashboard'
                className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center'
              >
                <Lock className='inline-block mr-1' size={18} />
                <span className='hidden sm:inline'>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to='/contact'
                  className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
                >
                  Contact
                </Link>
                <Link
                  to='/download'
                  className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
                >
                  Download
                </Link>
              </>
            )}

            {/* ✅ Auth buttons */}
            {user ? (
              <button
                className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                onClick={logout}
              >
                <LogOut size={18} />
                <span className='hidden sm:inline ml-2'>Log Out</span>
              </button>
            ) : (
              <>
<<<<<<< HEAD
                <Link to={'/signup'} className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'>
                  <UserPlus className='mr-2' size={18} />
                  Sign Up
                </Link>

                <Link to={'/login'} className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'>
=======
                <Link
                  to='/signup'
                  className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                >
                  <UserPlus className='mr-2' size={18} />
                  Sign Up
                </Link>
                <Link
                  to='/login'
                  className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                >
>>>>>>> 7cc0631 (Brandon commit)
                  <LogIn className='mr-2' size={18} />
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

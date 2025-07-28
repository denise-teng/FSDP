import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, navigate);
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#eef1fd] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
          Login to your account
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-lg sm:px-10 w-full max-w-md mx-auto mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border text-gray-900 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 bg-white border text-gray-900 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Password"
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 w-5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  Login
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Not a member?{" "}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

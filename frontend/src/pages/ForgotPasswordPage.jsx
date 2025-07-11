import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader } from 'lucide-react';
import axios from '../lib/axios'; // or use axios directly if not centralized
import { toast } from 'react-hot-toast'; // optional

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email }); // Adjust route if needed
      toast.success('Reset link sent! Please check your email.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>
          Forgot your password?
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-1/3 mx-auto mt-8'>
          <form onSubmit={handleSendReset} className='space-y-6'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
                Email Address
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
                </div>
                <input
                  id='email'
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className='mr-2 w-5 animate-spin' aria-hidden='true' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='mr-2 h-5 w-5' aria-hidden='true' />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

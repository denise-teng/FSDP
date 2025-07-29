import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Loader } from 'lucide-react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Missing reset token');

    setLoading(true);
    try {
      await axios.post(`/auth/reset-password?token=${token}`, { newPassword });
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f5faff] flex flex-col justify-center py-12 px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className='mt-6 text-center text-3xl font-bold text-blue-600'>
          Reset Your Password
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className='mt-8 mx-auto w-full max-w-md bg-white p-8 rounded-2xl shadow-md'>
          <form onSubmit={handleReset} className='space-y-6'>
            <div>
              <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700'>
                New Password
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
  id='newPassword'
  type='password'
  required
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  className='block w-full px-3 py-2 pl-10 bg-white text-gray-800 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
  placeholder='Enter your new password'
/>

              </div>
            </div>

            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className='mr-2 w-5 animate-spin' />
                  Resetting...
                </>
              ) : (
                <>
                  <CheckCircle className='mr-2 h-5 w-5' />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;

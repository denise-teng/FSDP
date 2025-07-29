import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');  // New state for name validation

  const { signup, loading } = useUserStore();

  const validatePassword = (password) => {
    if (password.length < 8) return 'Must be at least 8 characters';
    if (!/[a-zA-Z]/.test(password)) return 'Must include at least one letter';
    if (!/[0-9]/.test(password)) return 'Must include at least one number';
    return '';
  };

  const validateName = (name) => {
    // Allow letters and spaces, but not at the start or end of the name
    const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;  // Allows spaces between words
    if (!regex.test(name)) {
      return 'Name can only contain letters and spaces, and cannot start or end with a space.';
    }
    if (name.length > 30) {
      return 'Name cannot exceed 30 characters.';
    }
    return '';
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({ ...formData, name: newName });
    const error = validateName(newName);
    setNameError(error);  // Update the name error message as the user types
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    const error = validatePassword(newPassword);
    setPasswordError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate name one last time before submit
    const nameError = validateName(formData.name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const passwordCheck = validatePassword(formData.password);
    if (passwordCheck) {
      setPasswordError(passwordCheck);
      toast.error('Password does not meet criteria');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/initiate-signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success('Check your email to verify your account.');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordError('');
    } catch (error) {
      console.error('Signup Error:', error);
      const message = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(`Signup failed: ${message}`);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#eef1fd] min-h-screen">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
  >
    <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
      Create your account
    </h2>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
  >
    <div className="bg-white py-8 px-6 shadow-md sm:rounded-lg sm:px-10 w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
              <User className="h-5 w-5" />
            </div>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
          {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
        </div>

        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full px-3 py-2 pl-10 bg-white border border-indigo-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handlePasswordChange}
              className="block w-full px-3 py-2 pl-10 bg-white border text-gray-900 border-indigo-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="********"
            />
          </div>
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3  flex items-center pointer-events-none text-indigo-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="block w-full px-3 text-gray-700 py-2 pl-10 bg-white border border-indigo-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="********"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="mr-2 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login here <ArrowRight className="inline h-4 w-4" />
        </Link>
      </p>
    </div>
  </motion.div>
</div>

  );
};

export default SignUpPage;

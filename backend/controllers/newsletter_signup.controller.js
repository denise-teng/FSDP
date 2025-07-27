// components/NewsletterSignup.js
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const NewsletterSignup = ({ className = "" }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Subscription failed');
      
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full px-4 py-3 rounded-lg bg-indigo-900/50 border border-indigo-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>
        
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all text-sm shadow-lg hover:shadow-xl flex items-center justify-center ${
            isLoading ? 'bg-gray-500' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
          }`}
        >
          {isLoading ? 'Subscribing...' : (<>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>)}
        </button>

        {subscribed && (
          <div className="bg-green-900/30 border border-green-600 text-green-200 px-4 py-3 rounded-lg text-sm mt-4">
            Thank you for subscribing!
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsletterSignup;
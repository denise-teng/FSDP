import { useEffect } from 'react';
import { useProductStore } from '../stores/useProductStore';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Shawn Lim',
    title: 'AVP Technology, Tuan Sing Holdings Limited',
    message: 'Very professional and responsive. Highly recommend!',
    time: '5:48 PM  Sep 15, 2021',
  },
  {
    name: 'Melly',
    title: 'Accountant',
    message: 'Giving a honest opinion and true friend. Great time working with her.',
    time: '1:51 PM  Feb 8, 2022',
  },
  {
    name: 'Sau Mei',
    title: 'Senior accountant MNC',
    message: 'Quick to respond and clear with explanations. Very helpful!',
    time: '4:14 PM  Jan 26, 2022',
  },
];

const placeholderNewsletters = [
  {
    title: 'INFLATION AND YOU',
    tag: 'Inspiration',
    image: '/newsletter1.jpg',
  },
  {
    title: 'HOME DREAMERS',
    tag: 'Inspiration',
    image: '/newsletter2.jpg',
  },
  {
    title: 'BEFORE IT’S TOO LATE',
    tag: 'Inspiration',
    image: '/newsletter3.jpg',
  },
];

const HomePage = () => {
  const { fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <>
      <div className="min-h-screen bg-white text-black font-sans">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 pt-20 text-center">
          <img
            src="/your-photo.jpg"
            alt="advisor"
            className="w-40 h-40 mx-auto rounded-full object-cover shadow-lg"
          />
          <h1 className="mt-6 text-5xl font-bold leading-tight">ADVICE FOR ANY EXPERIENCE</h1>
          <p className="mt-2 text-lg text-gray-600 tracking-wide font-semibold">
            ESTATE PLANNING • RETIREMENT PLANNING • HEALTH INSURANCE
          </p>
          <p className="mt-6 text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
            <em>
              “Specializing in retirement planning, I help families secure their future with personalized
              insurance and wealth strategies. Known for patience, integrity, and putting clients first.
              Let’s chat over coffee!”
            </em>
          </p>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-4 mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 rounded-lg shadow p-6 border"
            >
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{t.title}</p>
              <p className="text-gray-800 text-sm mb-4">{t.message}</p>
              <p className="text-xs text-gray-400">{t.time}</p>
            </motion.div>
          ))}
        </section>

        {/* Show More Button */}
        <div className="text-center mt-10 mb-20">
          <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
            SHOW MORE +
          </button>
        </div>

        {/* Newsletter Section */}
        <section className="max-w-7xl mx-auto px-4 mt-20 text-center">
          <h2 className="text-3xl font-semibold mb-8">Latest Newsletter Issues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {placeholderNewsletters.map((item, index) => (
              <div key={index} className="rounded overflow-hidden shadow-lg bg-white">
                <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{item.tag}</p>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <button className="text-sm bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition">
                    Read Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Email Signup Section */}
      <section className="max-w-7xl mx-auto px-4 mt-20 mb-16 flex flex-col lg:flex-row items-center justify-between gap-10">
        <img
          src="/your-photo.jpg"
        
          className="w-48 h-48 rounded-full object-cover shadow-lg"
        />
        <div className="max-w-xl text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-indigo-700">Take your</span>{' '}
            <span className="text-indigo-700">financial future</span>
          </h2>
          <p className="text-gray-600 mb-4">
            Cheu Fong is your trusted partner to plan, protect, and prosper—together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
              Sign up for exclusive insights!!
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Join 600+ families who’ve secured their future
          </p>
        </div>
        
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-5xl font-extrabold mb-10 text-center leading-tight">
          COMMON<br />QUESTIONS
        </h2>
        <div className="space-y-4">
          {[
            "How do I start financial planning with you?",
            "What areas do you specialize in?",
            "Are your services fee-based?",
            "Can you advise expats or non-Mandarin speakers?",
            "How long does planning typically take?",
            "How often should I review my financial plan?",
            "What makes your approach different from other advisors?",
          ].map((q, i) => (
            <details key={i} className="border-b py-2 group cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-white">
                <span>{q}</span>
                <span className="transition-transform group-open:rotate-45 text-xl">+</span>
              </summary>
              <p className="mt-2 text-gray-200 text-sm">
                This is a placeholder answer.
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;

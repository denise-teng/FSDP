import { useEffect } from 'react';
import { useNewsletterStore } from '../stores/useNewsletterStore';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

  const handleTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags.map(tag => tag.trim()); // If it's an array, map and trim the values
    } else if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()); // If it's a string, split by commas
    }
    return []; // Return an empty array if neither condition is met
  };

const testimonials = [
  {
    name: 'Shawn Lim',
    title: 'AVP Technology, Tuan Sing Holdings Limited',
    message: 'Very professional and responsive. Highly recommend!',
    time: '5:48 PM  Sep 15, 2021',
    avatar: '/avatars/shawn.jpg'
  },
  {
    name: 'Melly',
    title: 'Accountant',
    message: 'Giving a honest opinion and true friend. Great time working with her.',
    time: '1:51 PM  Feb 8, 2022',
    avatar: '/avatars/melly.jpg'
  },
  {
    name: 'Sau Mei',
    title: 'Senior accountant MNC',
    message: 'Quick to respond and clear with explanations. Very helpful!',
    time: '4:14 PM  Jan 26, 2022',
    avatar: '/avatars/saumei.jpg'
  },
];

const HomePage = () => {
  const { homepageSlots, fetchNewsletters } = useNewsletterStore();

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-blue-50 py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block"
          >
            <img
              src="/public/images/Screenshot 2025-07-13 153013.png"
              alt="Financial Advisor"
              className="w-32 h-32 mx-auto rounded-full object-cover shadow-xl border-4 border-white"
            />
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-4xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            ADVICE FOR ANY LIFE STAGE
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-lg md:text-xl text-gray-600 font-medium"
          >
            ESTATE PLANNING • RETIREMENT STRATEGIES • HEALTHCARE PROTECTION
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
              "Specializing in retirement planning, I help families secure their future with personalized
              insurance and wealth strategies. Known for patience, integrity, and putting clients first.
              Let's chat over coffee!"
            </blockquote>
            <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center mx-auto">
              Schedule Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "15+", label: "Years Experience" },
            { value: "600+", label: "Families Helped" },
            { value: "$50M+", label: "Assets Managed" },
            { value: "98%", label: "Client Satisfaction" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            What Clients Say
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={t.avatar} 
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{t.name}</h3>
                      <p className="text-sm text-gray-500">{t.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">"{t.message}"</p>
                  <p className="text-xs text-gray-400">{t.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 transition flex items-center mx-auto">
              View More Testimonials <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Latest Financial Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed with our monthly newsletter covering retirement planning, investment strategies, and more.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homepageSlots.map((slot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
              >
                {slot ? (
                  <>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={slot.thumbnailUrl || '/placeholder-newsletter.jpg'} 
                        alt={slot.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
{slot.tags && handleTags(slot.tags).map((tag, index) => (
  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-black">
    {tag}
  </span>
))}

                      </div>
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                        {slot.title}
                      </h3>
                      <a
                        href={slot.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Read Newsletter <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-500">Featured Slot {index + 1}</h3>
                    <p className="text-sm text-gray-400 mt-1">Coming soon</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Secure Your Financial Future?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Get personalized advice tailored to your unique situation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-3 bg-white text-indigo-600 rounded-full font-medium hover:bg-gray-100 transition shadow-lg">
              Book Free Consultation
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-full font-medium hover:bg-indigo-700 transition">
              Download Planning Guide
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
            <p className="text-gray-600">
              Get answers to frequently asked questions about financial planning
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {[
              {
                question: "How do I start financial planning with you?",
                answer: "We begin with a complimentary discovery call to understand your goals and challenges. From there, we'll create a customized roadmap for your financial future."
              },
              {
                question: "What areas do you specialize in?",
                answer: "I specialize in retirement planning, estate preservation, tax-efficient strategies, and healthcare protection for individuals and families."
              },
              {
                question: "Are your services fee-based?",
                answer: "My compensation structure is transparent and varies by service. Some plans are fee-based while others are commission-based. We'll discuss this upfront with no obligations."
              },
              {
                question: "Can you advise expats or non-Mandarin speakers?",
                answer: "Absolutely! I'm fluent in English and Mandarin, and have extensive experience working with expatriates and international families."
              },
              {
                question: "How long does planning typically take?",
                answer: "The initial comprehensive plan takes 2-4 weeks. Ongoing management and reviews are scheduled quarterly or as needed based on your situation."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border-b border-gray-200 pb-4"
              >
                <details className="group">
                  <summary className="flex justify-between items-center py-4 cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition">
                      {item.question}
                    </h3>
                    <div className="text-indigo-600 group-open:rotate-180 transition-transform">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </summary>
                  <p className="mt-2 text-gray-600">
                    {item.answer}
                  </p>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
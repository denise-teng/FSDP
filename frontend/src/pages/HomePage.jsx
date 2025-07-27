import { useEffect, useState } from 'react';
import { useNewsletterStore } from '../stores/useNewsletterStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, X, Check, MapPin, Phone, Mail } from 'lucide-react';


// Add this to your global CSS or at the top of your component file
const globalStyles = `
  .aws-hover-card {
    transition: all 0.2s ease;
    border: 1px solid transparent;
    border-radius: 8px;
  }
  
  .aws-hover-card:hover {
    border-color: rgba(147, 197, 253, 0.5);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 
                0 0 0 1px rgba(147, 197, 253, 0.5);
    transform: translateY(-2px);
  }
  
  .aws-hover-button {
    transition: all 0.2s ease;
  }
  
  .aws-hover-button:hover {
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }
`;

// Add this component at the root of your app
const GlobalStyles = () => <style>{globalStyles}</style>;

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
    title: 'AVP Technology, Tuan Sing Holdings Limited ~ Client',
    message: 'Very professional and responsive. Out of every financial advisor I\'ve encountered, she is the best.',
    time: 'Sep 15, 2021, 5:48 PM',
    avatar: '/images/63e7e16e680f5.webp',
  },
  {
    name: 'Joey Tan',
    title: 'Client - Retirement Planning',
    message: 'Ms Yip is friendly and genuine. Our planning journey was smooth and productive.',
    time: 'Feb 8, 2022, 1:51 PM',
    avatar: '/images/360_F_135591950_9xTBp9qb4hFHNGMivMkMzFt8U0o8LlUL.jpg',
  },
  {
    name: 'Sau Mei',
    title: 'Secondary School Teacher ~ Client',
    message: 'Clear with explanations. She took time to ensure I understood my retirement plan.',
    time: 'Jan 26, 2022, 4:14 PM',
    avatar: 'images/beautiful-asian-woman-portrait_23-2148976845.avif',
  },
  {
    name: 'Michael Chan',
    title: 'Senior Engineer ~ Client',
    message: 'She helped structure my wealth plan efficiently. I now have better peace of mind.',
    time: 'Nov 30, 2022, 10:10 AM',
    avatar: 'images/depositphotos_220705662-stock-photo-portrait-middle-aged-chinese-asian.jpg',
  },
  {
    name: 'Rachel Ng',
    title: 'Young Professional ~ Insurance Client',
    message: 'The most patient and genuine advisor I\'ve met. No pressure and very clear!',
    time: 'Jul 12, 2023, 2:00 PM',
    avatar: '/public/images/istockphoto-1311084168-612x612.jpg',
  },
  {
    name: 'Amirul Hassan',
    title: 'Client - Wealth Management',
    message: 'Helped me diversify with long-term planning in mind. Appreciate the thorough follow-ups!',
    time: 'May 3, 2024, 6:22 PM',
    avatar: 'images/1000_F_302945354_dqIiUiITKpard7fBVKDLtffIqnkDbyo4.jpg',
  },
];


const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);

  // Add useEffect to handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the #
      if (hash) {
        // Find the service in either specialized or other arrays
        const allServices = [...services.specialized, ...services.other];
        const serviceToShow = allServices.find(
          service => service.title.toLowerCase().replace(/\s+/g, '-') === hash
        );
        if (serviceToShow) {
          setSelectedService(serviceToShow);
          // Scroll to services section if not already visible
          document.getElementById('services')?.scrollIntoView();
        }
      }
    };

    // Check on initial load
    handleHashChange();

    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);


  const services = {
    specialized: [
      {
        title: "Retirement Planning",
        description: "Comprehensive strategies to ensure a comfortable retirement tailored to your lifestyle goals and financial situation.",
        image: "/images/retirement_image.webp",
        details: [
          "Personalized retirement income planning",
          "Pension optimization strategies",
          "Tax-efficient withdrawal planning",
          "Long-term care considerations"
        ]
      },
      {
        title: "Financial Planning",
        description: "Holistic approach to managing your finances and achieving your life goals through careful planning.",
        image: "images/Financial-Planning_image.jpg",
        details: [
          "Cash flow analysis",
          "Debt management strategies",
          "Education funding plans",
          "Comprehensive wealth management"
        ]
      },
      {
        title: "Health Insurance",
        description: "Tailored health coverage solutions to protect you and your family against medical expenses.",
        image: "images/health_insurance_image.avif",
        details: [
          "Individual & family health plans",
          "Critical illness coverage",
          "Hospitalization plans",
          "Long-term care insurance"
        ]
      }
    ],
    other: [
      {
        title: "Estate Planning",
        description: "Protect your legacy and ensure your assets are distributed according to your wishes.",
        image: "images/estate_planning_image.gif",
        details: [
          "Will and trust preparation",
          "Power of attorney setup",
          "Estate tax minimization",
          "Charitable giving strategies"
        ]
      },
      {
        title: "Key Person Insurance",
        description: "Protect your business from financial loss due to the death or disability of key employees.",
        image: "images/key-person-insurance_image.png",
        details: [
          "Business continuity planning",
          "Key employee identification",
          "Customized coverage solutions",
          "Buy-sell agreement funding"
        ]
      },
      {
        title: "Consulting",
        description: "Expert advice for your unique financial situation and business needs.",
        image: "images/consulting_image.jpg",
        details: [
          "One-on-one financial reviews",
          "Investment portfolio analysis",
          "Risk assessment",
          "Customized financial roadmaps"
        ]
      }
    ]
  };

  return (
    <section id="services" className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Specialized financial solutions tailored to your needs
          </p>
        </motion.div>

        {/* Combined Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...services.specialized, ...services.other].map((service, index) => (
            <motion.div
              key={`service-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedService(service)}
            >
              <div className="h-40 overflow-hidden">
                <motion.img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{service.description}</p>
                <button
                  className="text-sm text-indigo-600 font-medium flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                  }}
                >
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Service Modal */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <div className="h-64 w-full overflow-hidden">
                    <img
                      src={selectedService.image}
                      alt={selectedService.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    onClick={() => setSelectedService(null)}
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedService.title}</h3>
                  <p className="text-gray-600 mb-6">{selectedService.description}</p>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Service Includes:</h4>
                    <ul className="space-y-2">
                      {selectedService.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    Schedule Consultation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};


const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('http://localhost:5000/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Subscription failed');
    }

    const data = await response.json();
    console.log('Success:', data);
    setSubscribed(true);
    setEmail(''); // Reset email field
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  // Handle navigation - works with or without React Router
  const navigateTo = (path) => {
    try {
      // Try using React Router if available
      if (window.ReactRouter) {
        window.ReactRouter.navigate(path);
      } else {
        // Fallback to regular navigation
        window.location.href = path;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    }
  };

  // Handle anchor scrolling
  const scrollToSection = (id) => {
    try {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Scroll error:', error);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-950 text-gray-200 pt-16 pb-8 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"> {/* Reduced gap and margin */}
          {/* Description Column with Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-white text-xl font-semibold mb-4 pb-2 border-b border-indigo-800 inline-block">Financial Freedom</h3> {/* Reduced margin */}
            <p className="text-gray-400 text-sm mb-4"> {/* Smaller text */}
              Personalized financial strategies for your future security.
            </p>

            {/* Contact Info */}
{/* Contact Info */}
{/* Contact Info */}
<div className="space-y-2 text-sm text-gray-400">
  <a 
    href="https://maps.google.com/?q=123+Financial+Ave,+Singapore+123456" 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center hover:text-white transition-colors"
  >
    <MapPin className="w-4 h-4 mr-2" />
    123 Financial Ave, Singapore 123456
  </a>
  
  <a 
    href="tel:+6588058250" 
    className="flex items-center hover:text-white transition-colors"
  >
    <Phone className="w-4 h-4 mr-2" />
    +65 88058250
  </a>
  
  <a 
    href="mailto:yipchuefong@gmail.com" 
    className="flex items-center hover:text-white transition-colors"
  >
    <Mail className="w-4 h-4 mr-2" />
    yipchuefong@gmail.com
  </a>
  <br></br>

  {/* Social Media Links */}
  <div className="flex space-x-4 pt-2">
    <a 
      href="https://www.linkedin.com/in/yipcheufong/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white transition-colors"
      aria-label="LinkedIn"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </a>
    <a 
      href="https://www.instagram.com/cheufong" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white transition-colors"
      aria-label="Instagram"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    </a>
  </div>
</div>
          </motion.div>

          {/* Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-white text-xl font-semibold mb-6 pb-2 border-b border-indigo-800 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", id: "hero", type: "anchor" },
                { label: "About", id: "stats", type: "anchor" },
                { label: "Services", id: "services", type: "anchor" },
                { label: "Testimonials", id: "testimonials", type: "anchor" },
                { label: "FAQ", id: "faq", type: "anchor" },
                { label: "Contact", path: "/contact", type: "page" }
              ].map((item) => (
                <motion.li
                  key={item.id || item.path}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href={item.type === "anchor" ? `#${item.id}` : item.path}
                    className="text-gray-400 hover:text-white transition flex items-center group"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.type === "anchor") {
                        scrollToSection(item.id);
                      } else {
                        navigateTo(item.path);
                      }
                    }}
                  >
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition"></span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-white text-xl font-semibold mb-6 pb-2 border-b border-indigo-800 inline-block">Our Services</h3>
            <ul className="space-y-3">
              {[
                "Retirement Planning",
                "Financial Planning",
                "Health Insurance",
                "Estate Planning",
                "Key Person Insurance",
                "Consulting"
              ].map((service) => (
                <motion.li
                  key={service}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-white transition flex items-center group"
                    onClick={(e) => {
                      e.preventDefault();
                      const serviceId = service.toLowerCase().replace(/\s+/g, '-');
                      window.location.hash = serviceId;
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition"></span>
                    {service}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-6">
                Subscribe to our newsletter for financial tips, market updates, and exclusive insights.
              </p>

              {subscribed ? (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="bg-green-100 border border-green-500 text-green-800 px-4 py-3 rounded-lg text-sm shadow-lg"
  >
    <div className="flex items-center justify-center">
      <Check className="w-5 h-5 mr-2" />
      Thank you for subscribing!
    </div>
  </motion.div>
) : (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="relative">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full px-4 py-3 rounded-lg bg-white border border-indigo-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        required
      />
    </div>
    <button
      type="submit"
      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all text-sm shadow-lg hover:shadow-xl flex items-center justify-center"
    >
      Subscribe Now
      <ArrowRight className="ml-2 h-4 w-4" />
    </button>
  </form>
)}

            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="border-t border-indigo-800 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center mb-4 md:mb-0">
            <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Financial Freedom. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Sitemap'].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs md:text-sm text-gray-500 hover:text-white transition hover:underline"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-600">
              Registered Financial Advisor • MAS License No: ABC123456
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};



const HomePage = () => {
  const { homepageSlots, fetchNewsletters } = useNewsletterStore();
  const [showAll, setShowAll] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const visibleTestimonials = showAll
    ? testimonials
    : testimonials.slice(0, 3);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('http://localhost:5000/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Subscription failed');
    }

    const data = await response.json();
    console.log('Success:', data);
    setSubscribed(true);
    setEmail(''); // Reset email field
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="bg-white text-gray-900 font-sans">
      <GlobalStyles />
      {/* Hero Section */}
      <section id="hero" className="relative bg-gradient-to-br from-indigo-50 to-blue-50 py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block"
          >
            <img
              src="/images/Screenshot 2025-07-13 153013.png"
              alt="Financial Advisor"
              className="w-40.5 h-40.5 mx-auto rounded-full object-cover shadow-xl border-4 border-white"
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
              &quot;Specializing in retirement planning, I help families secure their future with personalized
              insurance and wealth strategies. Known for patience, integrity, and putting clients first.
              Let&apos;s chat over coffee!&quot;
            </blockquote>
            <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center mx-auto">
              Schedule Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about" className="py-16 bg-gray-50">
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

      <ServicesSection />

{/* Testimonials */}
{/* Testimonials */}
<section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
  <div className="max-w-6xl mx-auto">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"
    >
      What Clients Say
    </motion.h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {visibleTestimonials.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-2"
        >
          <div className="p-8">
            <div className="flex items-center mb-6">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-indigo-100 shadow-sm"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
                <p className="text-sm text-indigo-600">{t.title}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">&quot;{t.message}&quot;</p>
            <p className="text-xs text-gray-500 font-medium">{t.time}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="text-center mt-16">
      <button
        onClick={() => setShowAll(!showAll)}
        className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 font-semibold flex items-center mx-auto shadow-md hover:shadow-lg"
      >
        {showAll ? 'Show Less' : 'View More Testimonials'} 
        <ChevronDown className={`ml-2 h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
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
{/* Enhanced CTA Section */}
<section className="py-12 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
  <div className="max-w-4xl mx-auto text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Financial Future?</h2>
      <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
        Take the first step toward financial freedom with our expert guidance.
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row gap-4 justify-center"
    >
      <button 
        className="px-8 py-3 bg-white text-indigo-600 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
        Book Free Consultation
      </button>

      <a
  href="files/Dollars and Sense Ebook.pdf"
  download="Financial-Planning-Guide.pdf"
        className="px-8 py-3 border-2 border-white/80 text-white rounded-full font-semibold hover:bg-white/10 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download Planning Guide
      </a>
    </motion.div>

    <motion.p 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      viewport={{ once: true }}
      className="text-sm text-indigo-200 mt-8"
    >
      No obligations. No commitments. Just expert advice.
    </motion.p>
  </div>
</section>

{/* Newsletter Section */}
<section className="py-16 bg-indigo-50">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h2 className="text-3xl font-bold text-indigo-900 mb-4">
      Get Financial Insights
    </h2>
    <p className="text-gray-600 mb-8">
      Join our newsletter for exclusive tips and market updates
    </p>

    {subscribed ? (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm max-w-md mx-auto"
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-green-800">
              Thank you for subscribing! Please check your email to confirm.
            </p>
          </div>
        </div>
      </motion.div>
    ) : (
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-lg bg-white border border-indigo-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-lg text-white font-medium transition-all text-sm shadow-lg hover:shadow-xl flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Subscribe Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    )}

    <p className="text-xs text-gray-500 mt-4">
      We respect your privacy. Unsubscribe at any time.
    </p>
  </div>
</section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
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
      <Footer />
    </div>
  );
};

export default HomePage;
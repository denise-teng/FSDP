import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Check, X, Mail, Phone, MapPin, Clock, Star } from "lucide-react";

const PublicContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [flaggedKeywords, setFlaggedKeywords] = useState([]);

  // Fetch active keywords from database
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await axios.get('/keywords');
        if (response.data.success) {
          // Filter only active keywords and extract the keyword strings
          const activeKeywords = response.data.data
            .filter(keyword => keyword.isActive)
            .map(keyword => keyword.keyword);
          setFlaggedKeywords(activeKeywords);
        }
      } catch (error) {
        console.error('Error fetching keywords:', error);
        // Fallback to default keywords if API fails
        setFlaggedKeywords(['schedule', 'meeting', 'help', 'urgent']);
      }
    };

    fetchKeywords();
  }, []);

  const validate = (field, value) => {
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim() === "" ? "This field is required." : "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format.";
      case "phone":
        const phoneRegex = /^\+(\d{1,3})\d{7,15}$/;
        return phoneRegex.test(value) ? "" : "Phone number must include a valid country code without spaces (e.g. +6512345678).";
      case "message":
        return value.trim() === "" ? "This field is required." : "";
      case "subject":
        return value === "" ? "Please select a subject." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const checkForFlaggedKeywords = (message) => {
    const foundKeywords = flaggedKeywords.filter(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    return foundKeywords.length > 0 ? foundKeywords : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const error = validate(key, val);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
      return;
    }

    const flaggedKeywordsFound = checkForFlaggedKeywords(formData.message);
    console.log("Flagged keywords found:", flaggedKeywordsFound);

    try {
      console.log("Sending request to /contacts/public");
      const response = await axios.post("/contacts/public", {
        ...formData,
        flaggedKeywords: flaggedKeywordsFound
      });
      console.log("Response received:", response.data);
      
      toast.success("Message sent! Thank you.");
      setFormData({ firstName: "", lastName: "", phone: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to send message";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const renderIcon = (field) => {
    if (!formData[field]) return <div className="w-4 h-4" />;
    return errors[field] ? <X className="text-red-500 w-4 h-4" /> : <Check className="text-green-500 w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 pt-24">
      {/* Enhanced Header Section */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
        
        <div className="relative flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Contact Me
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Let's discuss your financial goals over coffee or a call.</p>
          </div>
          <div className="relative">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Contact Information Card */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <h2 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Contact Information
            </span>
          </h2>
          
          <p className="text-gray-600 text-lg mb-8 italic">
            Start the chat to begin planning your financial future wisely.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Email</h3>
                <a href="mailto:yipchuefong@gmail.com" className="text-purple-600 hover:text-purple-700 transition-colors">
                  yipchuefong@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Phone</h3>
                <p className="text-gray-600">+65 1234 5678</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Location</h3>
                <p className="text-gray-600">Singapore</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Availability</h3>
                <p className="text-gray-600">9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["firstName", "lastName", "email", "phone"].map((field) => (
              <div key={field} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    {field === "firstName" ? "First Name" : 
                     field === "lastName" ? "Last Name" : 
                     field === "email" ? "Email" : "Phone Number"}
                    <span className="text-red-500">*</span>
                  </label>
                  {renderIcon(field)}
                </div>
                <input
                  name={field}
                  type={field === "email" ? "email" : "text"}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={
                    field === "email"
                      ? "your@email.com"
                      : field === "phone"
                      ? "Eg. +6512345678"
                      : field === "firstName"
                      ? "John"
                      : "Doe"
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors[field] ? "border-red-300" : "border-gray-300"
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white placeholder-gray-500`}
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
                )}
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "General Inquiry",
                  "Investment Strategy Discussion",
                  "Retirement Planning Consultation",
                  "Estate/Legacy Planning",
                  "Insurance Policy Review",
                  "Corporate Financial Seminar Inquiry",
                ].map((s, i) => (
                  <label key={i} className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 hover:border-purple-300 hover:bg-purple-50/50 transition-colors">
                    <input
                      type="radio"
                      name="subject"
                      value={s}
                      checked={formData.subject === s}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                </label>
                {renderIcon("message")}
              </div>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.message ? "border-red-300" : "border-gray-300"
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white placeholder-gray-500`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicContactPage;
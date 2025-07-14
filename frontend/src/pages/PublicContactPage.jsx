import { useState } from "react";
import axios from "../lib/axios";  // Corrected relative import path
import { toast } from "react-hot-toast";
import { Check, X, Mail, Phone, MapPin, Clock } from "lucide-react"; // Importing icons

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

  const validate = (field, value) => {
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim() === "" ? "This field is required." : "";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format.";
      case "phone":
        return /^\d{8}$/.test(value) ? "" : "Phone number must be 8 digits.";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const error = validate(key, val);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await axios.post("/contacts/public", formData);
      toast.success("Message sent! Thank you.");
      setFormData({ firstName: "", lastName: "", phone: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const renderIcon = (field) => {
    if (!formData[field]) return <div className="w-4 h-4" />;
    return errors[field] ? <X className="text-red-500 w-4 h-4" /> : <Check className="text-green-500 w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black p-6 pt-24">
      {/* Contact Me Heading */}
      <h1 className="text-6xl font-bold text-center text-black mb-4 uppercase">
        CONTACT ME
      </h1>

      {/* Subtitle */}
      <p className="text-2xl text-center text-gray-600 mb-8">
        Let’s discuss your financial goals over coffee or a call.
      </p>

      {/* Form and Contact Information Container */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-8 justify-center">

        {/* Contact Information Box */}
        <div className="flex-1 bg-black p-6 rounded-lg shadow-md text-white flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-4">Contact Information</h2>
          
          {/* "Start the chat" message */}
          <p className="text-center text-gray-300 text-xl mb-12">
            <em>Start the chat to begin planning your financial future wisely.</em>
          </p>

          {/* Contact Information List - Left aligned */}
          <div className="flex flex-col items-start gap-6 w-full">
            <div className="flex items-center gap-3 text-2xl w-full">
              <Mail className="text-emerald-500" />
              <span>Email: <a href="mailto:someone@example.com" className="text-blue-600">someone@example.com</a></span>
            </div>
            <div className="flex items-center gap-3 text-2xl w-full">
              <Phone className="text-emerald-500" />
              <span>Phone: +65 1234 5678</span>
            </div>
            <div className="flex items-center gap-3 text-2xl w-full">
              <MapPin className="text-emerald-500" />
              <span>Location: Singapore</span>
            </div>
            <div className="flex items-center gap-3 text-2xl w-full">
              <Clock className="text-emerald-500" />
              <span>Availability: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-md">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["firstName", "lastName", "email", "phone"].map((field) => (
              <div key={field}>
                <div className="flex justify-between items-center">
                  <label className="text-lg capitalize text-black">
                    {field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : field === "email" ? "Email" : "Phone Number"} 
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
                      ? "Email"
                      : field === "phone"
                      ? "Phone Number"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  className="mt-1 w-full p-3 rounded bg-gray-100 text-black border border-gray-300 text-lg"
                />
                <div className="min-h-[1.25rem]">
                  {errors[field] && <p className="text-sm text-red-400">{errors[field]}</p>}
                </div>
              </div>
            ))}

            {/* Subject */}
            <div className="col-span-2">
              <label className="text-lg font-semibold mb-1 text-black block">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "General Inquiry",
                  "Investment Strategy Discussion",
                  "Retirement Planning Consultation",
                  "Estate/Legacy Planning",
                  "Insurance Policy Review",
                  "Corporate Financial Seminar Inquiry",
                ].map((s, i) => (
                  <label key={i} className="flex items-center gap-2 text-black">
                    <input
                      type="radio"
                      name="subject"
                      value={s}
                      checked={formData.subject === s}
                      onChange={handleChange}
                      className="accent-emerald-500"
                    />
                    {s}
                  </label>
                ))}
              </div>
              <div className="min-h-[1.25rem] mt-1">
                {errors.subject && <p className="text-sm text-red-400">{errors.subject}</p>}
              </div>
            </div>

            {/* Message */}
            <div className="col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-lg text-black">
                  Message <span className="text-red-500">*</span>
                </label>
                {renderIcon("message")}
              </div>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className="mt-1 w-full p-3 rounded bg-gray-100 text-black border border-gray-300 text-lg"
              />
              <div className="min-h-[1.25rem] mt-1">
                {errors.message && <p className="text-sm text-red-400">{errors.message}</p>}
              </div>
            </div>

            <div className="col-span-2 text-right">
              <button type="submit" className="bg-emerald-500 px-6 py-2 rounded hover:bg-emerald-600 transition text-lg">
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

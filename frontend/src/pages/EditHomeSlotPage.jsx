import UpdateHomepageModal from "../components/UpdateHomepageModal";

const EditHomeSlotPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Card */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          {/* Header Content */}
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                🏠 Edit Homepage Slot
              </h2>
              <p className="text-gray-600 text-lg">Customize the featured slot on your homepage</p>
            </div>
            
            {/* Animated Icon Container */}
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 22V12h6v10" 
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <UpdateHomepageModal />
        </div>
      </div>
    </div>
  );
};

export default EditHomeSlotPage;
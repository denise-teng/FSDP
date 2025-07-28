axios.defaults.withCredentials = true;
import { useEffect, useRef, useCallback } from 'react'; 
import axios from 'axios';
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import './index.css'; 
import { Toaster } from 'react-hot-toast';
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import { useCartStore } from "./stores/useCartStore";
import CategoryPage from "./pages/CategoryPage";
import CalendarPage from "./pages/CalendarPage";
import VerifyEmail from "./components/VerifyEmail";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminHomePage from "./pages/AdminHomepage";
import AddContactForm from './components/AddContactModal';
import ContactPage from "./pages/ContactPage";
import PublicContactPage from './pages/PublicContactPage';
import BroadcastPage from "./pages/BroadcastPage";
import ContentGenerationPage from './pages/ContentGenerationPage';
import DraftsPage from './pages/DraftsPage';
import UploadNewsletterPage from "./pages/UploadNewsletter";
import EditNewsletterPage from "./pages/EditNewsletterPage";
import UserPage from "./pages/UserPage";
import { throttle } from 'lodash';
import ConsultationBooking from './pages/ConsultationBookingPage';

function HomeRouter() {
  const { user } = useUserStore();
  const { getCartItems } = useCartStore();
  return user?.role === 'admin' ? <Navigate to="/admin-home" /> : <HomePage />;
}

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  const authChecked = useRef(false);

  const stableCheckAuth = useCallback(async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }, [checkAuth]);

useEffect(() => {
  if (!authChecked.current) {
    authChecked.current = true;
    stableCheckAuth().finally(() => {
      // Any cleanup or state updates
    });
  }
}, [stableCheckAuth]);

  useEffect(() => {
    if (user) {
      getCartItems();
    }
  }, [user, getCartItems]);

  // Engagement tracking
  useEffect(() => {
  if (!user || !user._id || !user.role) return;

  const userId = user._id;
  const userType = user.role;
  const sessionStart = Date.now();

  // Throttled click handler
  const handleClick = throttle(() => {
    const engagingTime = Math.floor((Date.now() - sessionStart) / 1000);
    
    axios.post("http://localhost:5000/api/engagements/log", {
      userId,
      userType,
      engagementType: "click",
      clicks: 1,
      engagingTime,
      replies: 0
    }).catch(console.error);
  }, 1000); // Throttle to 1 second

  const handleBeforeUnload = () => {
    const engagingTime = Math.floor((Date.now() - sessionStart) / 1000);
    
    // Use sendBeacon for reliability during page unload
    navigator.sendBeacon("http://localhost:5000/api/engagements/log", JSON.stringify({
      userId,
      userType,
      engagementType: "session",
      clicks: 0,
      engagingTime,
      replies: 0
    }));
  };

  document.addEventListener("click", handleClick);
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    document.removeEventListener("click", handleClick);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [user]);

  if (checkingAuth) return <LoadingSpinner />;

return (
  <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top, rgba(16,185,129,0.3)_0%, rgba(10,80,60,0.2)_45%, rgba(0,0,0,0.1)_100%)]' />
      </div>
    </div>

    <div className='relative z-50 pt-20'>
      <Navbar />
      <Routes>
        <Route path="/admin-home" element={
          user?.role === "admin" ? <AdminHomePage /> : <Navigate to="/" />
        } />
        <Route path="/" element={<HomeRouter />} />
        <Route path="/user-home" element={<HomePage />} />
        <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/secret-dashboard' element={
          user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />
        } />
        <Route path='/category/:category' element={<CategoryPage />} />
        <Route path='/booking' element={<ConsultationBooking />} />
        <Route path='/add-contact' element={
          user?.role === "admin" ? <AddContactForm /> : <Navigate to='/' />
        } />
        <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
        <Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
        <Route path='/secret-calendar' element={
          user?.role === "admin" ? <CalendarPage /> : <Navigate to='/login' />
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/contact' element={
          user?.role === 'admin' ? <ContactPage /> : <PublicContactPage />
        } />
        <Route
  path="/users"
  element={user?.role === "admin" ? <UserPage /> : <Navigate to="/login" />}
/>

        <Route path="/broadcasts" element={<BroadcastPage />} />
        <Route path="/drafts" element={user ? <DraftsPage /> : <Navigate to="/login" />} />
        <Route path="/edit-draft/:id" element={user ? <EditNewsletterPage isDraft={true} /> : <Navigate to="/login" />} />

        {/* Admin Routes */}
        <Route path='/secret-dashboard' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
        <Route path="/upload-newsletter" element={user?.role === "admin" ? <UploadNewsletterPage /> : <Navigate to="/login" />} />
        <Route path="/edit-newsletter/:id" element={user?.role === "admin" ? <EditNewsletterPage isDraft={false} /> : <Navigate to="/login" />} />
        <Route path="/content-generation" element={<ContentGenerationPage />} />


      </Routes>
    </div>
<Toaster
  position="top-center"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#ffffff',
      color: '#000000',
      border: '1px solid #e5e7eb', // optional light gray border
      borderRadius: '8px',
      padding: '12px 16px',
    },
    success: {
      iconTheme: {
        primary: '#10b981', // green icon
        secondary: '#d1fae5',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444', // red icon
        secondary: '#fee2e2',
      },
    },
  }}
/>

  </div >
);

}

export default App;
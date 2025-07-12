import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import './index.css'; // This file should include Tailwind imports
import { Toaster} from 'react-hot-toast';
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import { useCartStore } from "./stores/useCartStore";
import CategoryPage from "./pages/CategoryPage";
import CalendarView from "./components/CalendarView";
import NearEvents from "./components/NearEvents";
import CalendarPage from "./pages/CalendarPage";
import VerifyEmail from "./components/VerifyEmail";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminHomePage from "./pages/AdminHomepage";


function HomeRouter() {
  const { user } = useUserStore();

  if (!user) return <HomePage />; // Non-logged-in users
  if (user.role === 'admin') return <Navigate to="/admin-home" />;
  return <HomePage />; // Logged-in normal users
}


function App() {
  const {user, checkAuth, checkingAuth} = useUserStore();

  const {getCartItems} = useCartStore()

  useEffect(()=> {
    checkAuth();
  }, [checkAuth]);

useEffect (()=> {
  if(!user) return;
  getCartItems();
},[getCartItems, user]);

  if(checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden" >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 ">
            <div className= 'absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top, rgba(16,185,129,0.3)_0%, rgba(10,80,60,0.2)_45%, rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>

      <div className='relative z-50 pt-20' >
      <Navbar />
      <Routes>
      
        <Route path="/admin-home" element={<AdminHomePage />} />
        <Route path="/" element={<HomeRouter />} />
        <Route path="/user-home" element={<HomePage  />} />
        <Route path ='/signup' element={!user ? <SignUpPage/> : <Navigate to ='/'/>} />
        <Route path ='/login' element={!user ? <LoginPage/> : <Navigate to ='/'/>} />
        <Route path ='/secret-dashboard' element={user?.role === "admin" ? <AdminPage/> : <Navigate to ='/login'/>} />
        <Route path = '/category/:category' element = {<CategoryPage />} />
        <Route path = '/cart' element = {user ? <CartPage /> : <Navigate to ='/login '/>} />
        <Route path = '/purchase-success' element = {user ? <PurchaseSuccessPage /> : <Navigate to ='/login '/>} />
        <Route path = '/purchase-cancel' element = {user ? <PurchaseCancelPage /> : <Navigate to ='/login '/>} />
        <Route path = '/secret-calendar' element={user?.role === "admin" ? <CalendarPage /> : <Navigate to ='/login'/>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />

      </Routes>
      </div>
      <Toaster/>
</div>
  )};


export default App

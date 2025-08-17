// pages/VerifyEmail.jsx
import { useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const data = params.get('data');

      if (!data) {
        
        return;
      }

      try {
        await axios.get(`/api/auth/complete-signup?data=${data}`);
        toast.success('Email verified. You can now log in.');
        navigate('/login');
        return;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Verification failed');
      }
    };

    verify();
  }, [params, navigate]);

  return (
    <div className="text-white text-center mt-10">
      Verifying your email, please wait...
    </div>
  );
};

export default VerifyEmail;

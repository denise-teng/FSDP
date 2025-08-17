import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useUserStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens (you might want to use cookies instead)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Verify auth and redirect
      checkAuth().then(() => {
        toast.success('Logged in successfully!');
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [checkAuth, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p>Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthSuccessPage;
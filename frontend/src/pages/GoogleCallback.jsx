import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get('code');
    
    if (code) {
      axios.post('/api/auth/google', { code }, { withCredentials: true })
        .then(res => {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          navigate(res.data.user.role === 'admin' ? '/admin-home' : '/user-home');
        })
        .catch(error => {
          toast.error(error.response?.data?.message || 'Login failed');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, []);

  return <div className="flex items-center justify-center min-h-screen">Processing login...</div>;
}
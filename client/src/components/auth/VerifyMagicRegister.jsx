import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function VerifyMagicRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-magic-register/${token}`,
          { credentials: 'include' }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(`Welcome ${data.user.name}! Your username is @${data.user.username}`);
        
          await new Promise((resolve) => setTimeout(resolve, 1500));
      
          await refetchUser();
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          setStatus('error');
          setMessage(data.message || 'Registration verification failed');
          
    
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
        setMessage('Network error during verification');
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    verify();
  }, [token, navigate, refetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center font-[Space_Grotesk] bg-gray-50 p-4">
      <div className="w-full max-w-md border-2 border-black shadow-[6px_6px_0_0_#000] bg-white p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Completing your registration...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-green-600 mb-2">Registration Complete!</p>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to your dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-bold text-red-600 mb-2">Verification Failed</p>
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to home page...</p>
          </div>
        )}
      </div>
    </div>
  );

}

export default VerifyMagicRegister;

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-magic-link/${token}`,
          { credentials: 'include' }  
        );

        if (response.ok) {
          setStatus('success');
          await new Promise((resolve) => setTimeout(resolve, 500));
          await refetchUser();
          navigate('/dashboard', { replace: true });
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        setStatus('error');
      }
    };

    if (token) verify();
  }, [token, navigate, refetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center font-[Space_Grotesk]">
      {status === 'verifying' && <p>Verifying link...</p>}
      {status === 'success' && <p>✓ Verified! Redirecting...</p>}
      {status === 'error' && <p>✗ Invalid or expired link</p>}
    </div>
  );
}

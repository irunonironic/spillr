
import { useState, useEffect } from 'react';

const LoadingWrapper = ({ children, isLoading, minLoadTime = 300 }) => {
  const [showContent, setShowContent] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setInternalLoading(false);
        requestAnimationFrame(() => {
          setShowContent(true);
        });
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadTime]);

  if (internalLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600" style={{ fontFamily: "Space Grotesk" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity: showContent ? 1 : 0,
        transform: showContent ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default LoadingWrapper;
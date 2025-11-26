import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DynamicMeta = ({ title, description, image, url, type = 'website' }) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (property, content, isProperty = true) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Update all meta tags
    const fullUrl = url || window.location.href;
    
    // Standard meta tags
    updateMetaTag('description', description, false);
    
    // Open Graph tags
    updateMetaTag('og:type', type);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:site_name', 'Spillr');
    
    // Image dimensions for better rendering
    if (image) {
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:alt', title || 'Spillr - Anonymous Messaging');
      updateMetaTag('og:image:type', 'image/png'); // X prefers knowing the type
    }
    
    // Twitter Card tags - CRITICAL FOR X/TWITTER
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:site', '@spillr', false); // Add your Twitter handle if you have one
    updateMetaTag('twitter:creator', '@spillr', false); // Add your Twitter handle
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', image, false);
    updateMetaTag('twitter:url', fullUrl, false);
    
    // Additional Twitter tags
    if (image) {
      updateMetaTag('twitter:image:alt', title || 'Spillr', false);
      // X/Twitter also wants to know dimensions
      updateMetaTag('twitter:image:width', '1200', false);
      updateMetaTag('twitter:image:height', '630', false);
    }

  }, [title, description, image, url, type, location]);

  return null;
};

export default DynamicMeta;
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const url = new URL(imagePath);
    url.searchParams.delete('t');
    const cleanUrl = url.origin + url.pathname;
   // console.log(' Returning Cloudinary URL:', cleanUrl);
    return cleanUrl;
  }
  

  if (imagePath.includes('cloudinary.com')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return `${baseUrl}${imagePath}`;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL 
  const cleanPath = imagePath.replace(/^\/+/, '');
  const finalUrl = `${baseUrl}/${cleanPath}`;
  //console.log('Returning local URL:', finalUrl);
  return finalUrl;
};

export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return name[0].toUpperCase();
};

export const isValidImageUrl = (url) => {
  if (!url) return false;
  return (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('/uploads/') ||
    url.includes('cloudinary.com')
  );
};


export const createPreviewUrl = (file) => {
  if (!file) return null;
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to create preview URL:', error);
    return null;
  }
};

export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      //console.error('Failed to revoke preview URL:', error);
    }
  }
};
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const url = new URL(imagePath);
    url.searchParams.delete('t');
    return url.origin + url.pathname;
  }

  if (imagePath.includes('cloudinary.com')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return `${baseUrl}${imagePath}`;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '??';
  const cleaned = name.trim();
  if (!cleaned) return '??';
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (cleaned.length >= 2) {
    return cleaned.substring(0, 2).toUpperCase();
  } else {
    return cleaned[0].toUpperCase();
  }
};

export const getAvatarColor = (name) => {
  if (!name) return '#FDE047';
  const colors = [
    '#c2b574ff', '#f4d178ff', '#FB923C', '#F87171', '#FB7185', '#E879F9',
    '#C084FC', '#A78BFA', '#818CF8', '#60A5FA', '#38BDF8', '#22D3EE',
    '#2DD4BF', '#34D399', '#4ADE80', '#A3E635'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const generateInitialsAvatar = (name, size = 200) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const textColor = '#000000';
  const fontSize = Math.floor(size * 0.4);
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="central"
      >${initials}</text>
    </svg>
  `.trim();
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

export const isValidImageUrl = (url) => {
  if (!url) return false;
  return (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('/uploads/') ||
    url.startsWith('data:image/') ||
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
      console.error('Failed to revoke preview URL:', error);
    }
  }
};

export const getAvatarUrl = (profilePicture, name, size = 200) => {
  if (profilePicture && isValidImageUrl(profilePicture)) {
    return getImageUrl(profilePicture);
  }
  return generateInitialsAvatar(name || 'User', size);
};

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please use JPG, PNG, or WebP' };
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File is too large. Maximum size is 5MB' };
  }
  return { valid: true };
};

export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

export default {
  getImageUrl,
  getInitials,
  getAvatarColor,
  generateInitialsAvatar,
  isValidImageUrl,
  createPreviewUrl,
  revokePreviewUrl,
  getAvatarUrl,
  validateImageFile,
  getImageDimensions
};

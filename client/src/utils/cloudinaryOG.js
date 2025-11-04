export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /\/v\d+\/([^/.]+)/,           // /v1234567/publicId
    /\/upload\/([^/.]+)/,         // /upload/publicId
    /cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?([^/]+)/  
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].split('.')[0];
    }
  }
  
  return null;
};

export const extractCloudName = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/res\.cloudinary\.com\/([^/]+)/);
  return match ? match[1] : process.env.VITE_CLOUDINARY_CLOUD_NAME;
};

export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') && url.includes('/upload/');
};


export const generateCloudinaryOGImage = (profilePicture) => {
  if (!profilePicture || !isCloudinaryUrl(profilePicture)) {
    return '/og-image.png';
  }

  const publicId = extractPublicId(profilePicture);
  const cloudName = extractCloudName(profilePicture);
  
  if (!publicId || !cloudName) {
    console.warn('Could not extract Cloudinary details from:', profilePicture);
    return '/og-image.png';
  }

  
  const transformations = [
    'w_1200',
    'h_630',
    'c_fill',
    'g_face',
    'b_rgb:FDE047',
    'q_auto',
    'f_auto'
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
};

// Generate OG image with text overlays (more complex, may fail)
export const generateCloudinaryOGImageWithText = ({ 
  profilePicture, 
  name, 
  username, 
  bio = '' 
}) => {
  if (!profilePicture || !isCloudinaryUrl(profilePicture)) {
    return '/og-image.png';
  }

  const publicId = extractPublicId(profilePicture);
  const cloudName = extractCloudName(profilePicture);
  
  if (!publicId || !cloudName) {
    return '/og-image.png';
  }

  const encodeName = encodeURIComponent((name || username).substring(0, 30));
  const encodeUsername = encodeURIComponent(`@${username}`.substring(0, 20));
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Use simpler transformation syntax
  const parts = [
    // Base canvas
    'w_1200,h_630,c_fill,b_rgb:FDE047',
    
    // Profile picture as layer
    `l_${publicId.replace(/\//g, ':')},w_240,h_240,c_fill,g_face,r_max,x_-400,y_-120`,
    
    // Name text
    `co_rgb:000000,l_text:arial_72_bold:${encodeName},x_-80,y_-100`,
    
    // Username text  
    `co_rgb:666666,l_text:arial_48:${encodeUsername},x_-80,y_0`,
    
    // Spillr branding
    'co_rgb:000000,l_text:arial_40_bold:Spillr,g_south_east,x_40,y_40'
  ];

  // Join with slash separator
  return `${baseUrl}/${parts.join('/')}/${publicId}`;
};

export const getOGImageUrl = (userProfile) => {
  if (!userProfile || !userProfile.profilePicture) {
    return '/og-image.png';
  }

  try {

    const simpleUrl = generateCloudinaryOGImage(userProfile.profilePicture);
    // If you want text overlays, uncomment this:
    // const textUrl = generateCloudinaryOGImageWithText(userProfile);
    // return textUrl;
    
    return simpleUrl;
  } catch (error) {
    console.error('Error generating OG image:', error);
    return '/og-image.png';
  }
};

export default {
  generateCloudinaryOGImage,
  generateCloudinaryOGImageWithText,
  extractPublicId,
  extractCloudName,
  isCloudinaryUrl,
  getOGImageUrl
};
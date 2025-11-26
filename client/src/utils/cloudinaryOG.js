import { getInitials } from './imageHelper';

const getCloudinaryCloudName = () => {
  const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (envCloudName) return envCloudName;
  return null;
};

export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/,
    /\/image\/upload\/(?:v\d+\/)?(.+?)$/,
    /cloudinary\.com.*\/([^\/]+\/[^\/\.]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/\.[^.]+$/, '');
    }
  }
  return null;
};

export const extractCloudName = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/res\.cloudinary\.com\/([^\/]+)/);
  return match ? match[1] : null;
};

export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') && url.includes('/upload/');
};

export const generateCloudinaryOGImage = ({ profilePicture, name, username, bio = '' }) => {
  if (!profilePicture) {
    return generateDefaultOGImage({ name, username, bio });
  }

  const publicId = extractPublicId(profilePicture);
  const cloudName = extractCloudName(profilePicture) || getCloudinaryCloudName();
  
  if (!publicId || !cloudName) {
    console.warn('Could not extract Cloudinary details from:', profilePicture);
    return generateDefaultOGImage({ name, username, bio });
  }

  // Simplified text encoding for better compatibility
  const encodeName = encodeURIComponent(name || username).replace(/%20/g, '+');
  const encodeUsername = encodeURIComponent(`@${username}`).replace(/%20/g, '+');
  const encodeBio = bio ? encodeURIComponent(bio.substring(0, 80)).replace(/%20/g, '+') : '';

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Simplified transformation chain - X/Twitter is picky about complex transformations
  const transformations = [
    // Canvas setup
    'w_1200,h_630,c_fill,b_rgb:FDE047', // Yellow background
    
    // Add profile picture
    `l_${publicId.replace(/\//g, ':')},w_180,h_180,c_fill,g_face,r_max,x_-450,y_0`,
    'fl_layer_apply',
    
    // Add name text
    `l_text:Arial_48_bold:${encodeName},co_rgb:000000,x_-150,y_-60`,
    'fl_layer_apply',
    
    // Add username
    `l_text:Arial_32:${encodeUsername},co_rgb:000000,x_-150,y_0`,
    'fl_layer_apply',
  ];

  // Add bio if present
  if (bio) {
    transformations.push(
      `l_text:Arial_24:${encodeBio},co_rgb:000000,w_600,c_fit,x_-150,y_60`,
      'fl_layer_apply'
    );
  }

  // Add branding
  transformations.push(
    'l_text:Arial_32_bold:Spillr,co_rgb:000000,g_south_east,x_40,y_40',
    'fl_layer_apply',
    
    // Quality and format settings for social media
    'f_auto,q_auto:good'
  );

  const transformationString = transformations.join('/');
  
  // Use a simple base image
  return `${baseUrl}/${transformationString}/sample.jpg`;
};

export const generateDefaultOGImage = ({ name, username, bio = '' }) => {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) {
    return '/og-image-default.png';
  }

  const initials = getInitials(name || username);
  const encodeName = encodeURIComponent(name || username).replace(/%20/g, '+');
  const encodeUsername = encodeURIComponent(`@${username}`).replace(/%20/g, '+');
  const encodeInitials = encodeURIComponent(initials).replace(/%20/g, '+');
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transformations = [
    'w_1200,h_630,c_fill,b_rgb:FDE047',
    
    // Large initials on left
    `l_text:Arial_140_bold:${encodeInitials},co_rgb:000000,g_west,x_80`,
    'fl_layer_apply',
    
    // Name on right
    `l_text:Arial_48_bold:${encodeName},co_rgb:000000,g_east,x_-80,y_-80`,
    'fl_layer_apply',
    
    // Username
    `l_text:Arial_32:${encodeUsername},co_rgb:000000,g_east,x_-80,y_0`,
    'fl_layer_apply',
    
    // Tagline
    'l_text:Arial_28:Send+anonymous+messages,co_rgb:000000,g_east,x_-80,y_80',
    'fl_layer_apply',
    
    // Branding
    'l_text:Arial_32_bold:Spillr,co_rgb:000000,g_south_east,x_40,y_40',
    'fl_layer_apply',
    
    'f_auto,q_auto:good'
  ];

  return `${baseUrl}/${transformations.join('/')}/sample.jpg`;
};

export const getOGImageUrl = (userProfile) => {
  if (!userProfile) {
    return '/og-image-default.png';
  }

  const { profilePicture, name, username, bio } = userProfile;

  if (profilePicture && isCloudinaryUrl(profilePicture)) {
    try {
      return generateCloudinaryOGImage({
        profilePicture,
        name: name || username,
        username,
        bio: bio || ''
      });
    } catch (error) {
      console.error('Error generating Cloudinary OG image:', error);
    }
  }

  try {
    return generateDefaultOGImage({
      name: name || username,
      username,
      bio: bio || ''
    });
  } catch (error) {
    console.error('Error generating default OG image:', error);
  }

  return '/og-image-default.png';
};

export default {
  generateCloudinaryOGImage,
  generateDefaultOGImage,
  extractPublicId,
  extractCloudName,
  isCloudinaryUrl,
  getOGImageUrl
};
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

  const encodeName = encodeURIComponent(name || username);
  const encodeUsername = encodeURIComponent(`@${username}`);
  const encodeBio = bio ? encodeURIComponent(bio.substring(0, 100)) : '';

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transformations = [
    'w_1200',
    'h_630',
    'c_fill',
    'g_face',
    'q_auto',
    'f_auto',
    'b_rgb:FCF194', // yellow-200 background
    'bo_8px_solid_black',
    `l_${publicId.replace(/\//g, ':')}`,
    'w_200',
    'h_200',
    'c_fill',
    'g_face',
    'r_max',
    'bo_4px_solid_black',
    'g_north_west',
    'x_80',
    'y_80',
    'co_rgb:000000', // black text
    `l_text:Arial_60_bold:${encodeName}`,
    'g_north_west',
    'x_320',
    'y_120',
    `l_text:Arial_40:${encodeUsername}`,
    'g_north_west',
    'x_320',
    'y_200',
    ...(bio ? [
      `l_text:Arial_28:${encodeBio}`,
      'g_north_west',
      'x_320',
      'y_270',
      'w_800',
    ] : []),
    'co_rgb:000000',
    'l_text:Arial_36_bold:Spillr',
    'g_south_east',
    'x_60',
    'y_60',
    'l_text:Arial_24:Send%20me%20anonymous%20messages',
    'g_south_west',
    'x_60',
    'y_60',
  ];

  const transformationString = transformations.join(',');
  return `${baseUrl}/${transformationString}/${publicId}`;
};

export const generateDefaultOGImage = ({ name, username, bio = '' }) => {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) {
    return '/og-image-default.png';
  }

  const encodeName = encodeURIComponent(name || username);
  const encodeUsername = encodeURIComponent(`@${username}`);
  const initials = getInitials(name || username);
  const encodeInitials = encodeURIComponent(initials);
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transformations = [
    'w_1200',
    'h_630',
    'c_fill',
    'b_rgb:FCF194', // yellow-200 background
    'bo_8px_solid_black',
    'co_rgb:000000', // black text
    `l_text:Arial_180_bold:${encodeInitials}`,
    'g_west',
    'x_100',
    `l_text:Arial_60_bold:${encodeName}`,
    'g_east',
    'x_-100',
    'y_-80',
    `l_text:Arial_40:${encodeUsername}`,
    'g_east',
    'x_-100',
    'y_0',
    `l_text:Arial_32:Send%20anonymous%20messages`,
    'g_east',
    'x_-100',
    'y_80',
    `l_text:Arial_36_bold:Spillr`,
    'g_south_east',
    'x_60',
    'y_60',
  ];

  return `${baseUrl}/${transformations.join(',')}/sample.jpg`;
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

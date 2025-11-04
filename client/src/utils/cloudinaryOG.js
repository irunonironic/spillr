const getCloudinaryCloudName = () => {
    const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
     if (envCloudName) return envCloudName;

     return null;

}

export const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/,  
    /\/image\/upload\/(?:v\d+\/)?(.+?)$/,      
    /cloudinary\.com.*\/([^\/]+\/[^\/\.]+)/    
  ];

  for(const pattern of patterns) {
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

export const generateCloudinaryOGImage = ({ 
  profilePicture, 
  name, 
  username, 
  bio = '' 
}) => {
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
    'w_1200',           // Width for OG image
    'h_630',            // Height for OG image
    'c_fill',           // Fill crop mode
    'g_face',           // Focus on face
    'q_auto',           // Auto quality
    'f_auto',           // Auto format
    
    
    'b_rgb:FDE047',     // Yellow background (#FDE047)
    'bo_8px_solid_black', // Black border
    

    `l_${publicId.replace(/\//g, ':')}`, // Layer with profile picture
    'w_200',            // Profile picture width
    'h_200',            // Profile picture height
    'c_fill',           // Fill crop
    'g_face',           // Focus on face
    'r_max',            // Make it circular
    'bo_4px_solid_black', // Black border around profile
    'g_north_west',     // Position
    'x_80',             // X offset
    'y_80',             // Y offset
    
    // 4. Name text overlay
    'co_rgb:000',       // Black text color
    `l_text:Arial_60_bold:${encodeName}`,
    'g_north_west',     // Position
    'x_320',            // X offset (after profile pic)
    'y_120',            // Y offset
    
    // 5. Username text overlay
    'co_rgb:666',       // Gray text color
    `l_text:Arial_40:${encodeUsername}`,
    'g_north_west',     // Position
    'x_320',            // X offset
    'y_200',            // Y offset
    
    // 6. Bio text overlay (if exists)
    ...(bio ? [
      'co_rgb:333',     // Dark gray text
      `l_text:Arial_28:${encodeBio}`,
      'g_north_west',   // Position
      'x_320',          // X offset
      'y_270',          // Y offset
      'w_800',          // Max width for text wrap
    ] : []),
    
    // 7. "Spillr" branding
    'co_rgb:000',       // Black text
    'l_text:Arial_36_bold:Spillr',
    'g_south_east',     // Position at bottom right
    'x_60',             // X offset
    'y_60',             // Y offset
    
    // 8. "Send anonymous messages" tagline
    'co_rgb:666',       // Gray text
    'l_text:Arial_24:Send%20me%20anonymous%20messages',
    'g_south_west',     // Position at bottom left
    'x_60',             // X offset
    'y_60',             // Y offset
  ];

  const transformationString = transformations.join(',');
  return `${baseUrl}/${transformationString}/${publicId}`;
};


export const generateDefaultOGImage = ({ name, username, bio = '' }) => {
  const cloudName = getCloudinaryCloudName();
  
  // If no cloud name configured, return static default
  if (!cloudName) {
    return '/og-image.png';
  }

  const encodeName = encodeURIComponent(name || username);
  const encodeUsername = encodeURIComponent(`@${username}`);
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  const transformations = [
    'w_1200',
    'h_630',
    'c_fill',
    'b_rgb:FDE047',           // Yellow background
    'bo_8px_solid_black',     // Black border
    
    // Name
    'co_rgb:000',
    `l_text:Arial_80_bold:${encodeName}`,
    'g_center',
    'y_-100',
    
    // Username
    'co_rgb:666',
    `l_text:Arial_50:${encodeUsername}`,
    'g_center',
    'y_0',
    
    // Tagline
    'co_rgb:333',
    'l_text:Arial_32:Send%20anonymous%20messages%20on%20Spillr',
    'g_center',
    'y_100',
  ];

  // Use a blank template or colored rectangle
  return `${baseUrl}/${transformations.join(',')}/spillr_og_template.png`;
};

/**
 * Validate if URL is a valid Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') && url.includes('/upload/');
};


export const getOGImageUrl = (userProfile) => {
  if (!userProfile) {
    return '/og-image.png';
  }

  const { profilePicture, name, username, bio } = userProfile;

  // Check if profile picture is a Cloudinary URL
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

  // Fallback to default
  return '/og-image.png';
};

export default {
  generateCloudinaryOGImage,
  generateDefaultOGImage,
  extractPublicId,
  extractCloudName,
  isCloudinaryUrl,
  getOGImageUrl
};
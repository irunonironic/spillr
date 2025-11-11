export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const trimmed = email.trim();
  //console.log(' Validating email:', trimmed);
  
  if (trimmed.length === 0) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    //console.log(' Email regex failed'); 
    return 'Please enter a valid email address';
  }
  
  //console.log('Email validation passed'); 
  return null; 
};

export const validatePassword = (password, options = {}) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  
  const {
    minLength = 6, 
    maxLength = 128,
    requireConfirm = false,
    confirmPassword = '',
    strengthValidation = true
  } = options;
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  
  if (password.length > maxLength) {
    return `Password must be less than ${maxLength} characters long`;
  }
  
  if (strengthValidation) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasLowercase) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!hasUppercase) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
  }
  
  if (requireConfirm) {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
  }
  
  return null;
};


export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (trimmed.length > 50) {
    return 'Name must be less than 50 characters long';
  }
  
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  
  if (!nameRegex.test(trimmed)) {
    return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
  }
  
  return null;
};

export const validateText = (text, options = {}) => {
  const {
    minLength = 0,
    maxLength = 1000,
    required = false,
    fieldName = 'Field'
  } = options;
  
  if (required && (!text || typeof text !== 'string' || text.trim().length === 0)) {
    return `${fieldName} is required`;
  }
  
  if (!text) return null;
  
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (trimmed.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters long`;
  }
  
  return null;
};

export const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  }
  
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  
  if (username.length > 30) { 
    return "Username must be less than 30 characters";
  }
  
  const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]+$/;

  if (!usernameRegex.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  
  return null;
};


export const validateLoginPassword = (password) => {
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return 'Password is required';
  }
  return null;
};
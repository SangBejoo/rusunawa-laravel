/**
 * Validation utility functions for the Rusunawa tenant application
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email address";
  return "";
};

// Password validation - at least 8 chars with one number and one special char
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must contain at least one special character";
  return "";
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

// Name validation
export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return "";
};

// Phone number validation (Indonesian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone)) return "Invalid Indonesian phone number";
  return "";
};

// NIM (Nomor Induk Mahasiswa) validation
export const validateNIM = (nim) => {
  if (!nim) return "NIM is required";
  if (nim.length < 5) return "NIM must be at least 5 characters";
  return "";
};

// Address validation
export const validateAddress = (address) => {
  if (!address) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  return "";
};

// Date validation
export const validateDate = (date) => {
  if (!date) return "Date is required";
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(selectedDate.getTime())) return "Invalid date format";
  return "";
};

// Date range validation for booking
export const validateDateRange = (startDate, endDate) => {
  const errors = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!startDate) {
    errors.startDate = "Check-in date is required";
  } else if (isNaN(start.getTime())) {
    errors.startDate = "Invalid check-in date";
  } else if (start < today) {
    errors.startDate = "Check-in date cannot be in the past";
  }

  if (!endDate) {
    errors.endDate = "Check-out date is required";
  } else if (isNaN(end.getTime())) {
    errors.endDate = "Invalid check-out date";
  } else if (endDate && startDate && end <= start) {
    errors.endDate = "Check-out date must be after check-in date";
  }

  return errors;
};

// Form validation helper
export const validateForm = (form, validationRules) => {
  const errors = {};
  Object.keys(validationRules).forEach(field => {
    const value = form[field];
    const validationFn = validationRules[field];
    const error = validationFn(value);
    if (error) errors[field] = error;
  });
  return errors;
};

// Tenant type ID mapping
export const getTenantTypeId = (type) => {
  const typeMap = {
    'mahasiswa': 1,
    'non_mahasiswa': 2,
    'student': 1,
    'non-student': 2
  };
  
  return typeMap[type?.toLowerCase()] || 1; // Default to student/mahasiswa
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhone,
  validateNIM,
  validateAddress,
  validateDate,
  validateDateRange,
  validateForm,
  getTenantTypeId
};

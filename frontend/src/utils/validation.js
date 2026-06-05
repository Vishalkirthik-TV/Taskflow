export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateName = (name) => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
  return '';
};

export const validateTaskTitle = (title) => {
  if (!title.trim()) return 'Title is required';
  if (title.trim().length > 100) return 'Title cannot exceed 100 characters';
  return '';
};

export const validateTaskDescription = (description) => {
  if (description && description.length > 500) return 'Description cannot exceed 500 characters';
  return '';
};

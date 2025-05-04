
/**
 * Generates a secure random password
 * @param length Length of the password (default: 12)
 * @returns A secure random password
 */
export const generatePassword = (length: number = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill remaining length with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to make it more secure
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

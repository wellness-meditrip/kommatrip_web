/**
 * 이메일 유효성 검증
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검증
 * 8-16자, 대소문자, 숫자, 특수문자 포함
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8 || password.length > 16) {
    errors.push('Password must be 8-16 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // 특수문자: !"#$%&'()*+,-./:;?@[\]^_{|}~
  const specialChars = /[!"#$%&'()*+,\-./:;?@[\\\]^_{|}~]/;
  if (!specialChars.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 비밀번호 확인 일치 검증
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
